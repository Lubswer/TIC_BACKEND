import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import { Rol } from '../../domain/enums/Rol.js';
import { TicketCocina } from '../../domain/repositories/ITicketRepository.js';
import { INotificadorCocina } from '../../application/services/INotificadorCocina.js';

interface UsuarioSocketPayload {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export class SocketService implements INotificadorCocina {
  private static io: SocketIOServer | null = null;
  public static readonly SALA_COCINA = 'sala_cocina';

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

    this.io.on('connection', (socket: Socket) => {
      const usuario: UsuarioSocketPayload = (socket as any).usuario;

      if (usuario.rol === Rol.COCINA || usuario.rol === Rol.ADMIN) {
        socket.join(this.SALA_COCINA);
      }

      socket.on('disconnect', () => {});
    });
  }

  notificarNuevoTicket(ticket: TicketCocina): void {
    SocketService.emitirTicketNuevo(ticket);
  }

  static emitirTicketNuevo(ticket: TicketCocina): void {
    if (!this.io) return;
    this.io.to(this.SALA_COCINA).emit('ticket_nuevo', ticket);
  }

  static emitirTicketActualizado(data: { ticket_id: number; pedido_id: number; estado: string }): void {
    if (!this.io) return;
    this.io.emit('ticket_actualizado', data);
  }
}
