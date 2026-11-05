import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import { Rol } from '../../domain/enums/Rol.js';
import { TicketCocina } from '../../domain/repositories/ITicketRepository.js';

interface UsuarioSocketPayload {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export class SocketService {
  private static io: SocketIOServer | null = null;
  public static readonly SALA_COCINA = 'sala_cocina';

  /**
   * Inicializa la instancia de Socket.io acoplándola al servidor HTTP nativo.
   */
  static inicializar(servidorHttp: HttpServer): void {
    if (this.io) {
      return;
    }

    this.io = new SocketIOServer(servidorHttp, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Middleware de autenticación para WebSockets vía JWT
    this.io.use((socket: Socket, next) => {
      try {
        const authHeader = (socket.handshake.headers?.authorization as string) || '';
        const token =
          socket.handshake.auth?.token ||
          (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader) ||
          socket.handshake.headers?.token ||
          socket.handshake.query?.token;

        if (!token || typeof token !== 'string') {
          return next(new Error('Autenticación de socket fallida: Token no proporcionado.'));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET) as UsuarioSocketPayload;
        (socket as any).usuario = decoded;
        next();
      } catch (error) {
        next(new Error('Autenticación de socket fallida: Token inválido o expirado.'));
      }
    });

    // Manejo de eventos de conexión
    this.io.on('connection', (socket: Socket) => {
      const usuario: UsuarioSocketPayload = (socket as any).usuario;

      // Si el usuario conectado tiene rol cocina o admin, se une a la sala operativa de cocina
      if (usuario.rol === Rol.COCINA || usuario.rol === Rol.ADMIN) {
        socket.join(this.SALA_COCINA);
      }

      socket.on('disconnect', () => {
        // Desconexión limpia
      });
    });
  }

  /**
   * Emite el evento en vivo 'ticket_nuevo' exclusivamente hacia la sala de cocina.
   */
  static emitirTicketNuevo(ticket: TicketCocina): void {
    if (!this.io) return;
    this.io.to(this.SALA_COCINA).emit('ticket_nuevo', ticket);
  }

  /**
   * Emite el evento 'ticket_actualizado' cuando un ticket cambia de estado
   * (a 'en_preparacion' o 'listo').
   */
  static emitirTicketActualizado(data: { ticket_id: number; pedido_id: number; estado: string }): void {
    if (!this.io) return;
    this.io.emit('ticket_actualizado', data);
  }
}

