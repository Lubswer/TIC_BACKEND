import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import { Rol } from '../../domain/enums/Rol.js';
import { TicketCocina } from '../../domain/repositories/ITicketRepository.js';
import { INotificadorTiempoReal } from '../../application/services/INotificadorTiempoReal.js';

interface UsuarioSocketPayload {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export class SocketService implements INotificadorTiempoReal {
  private static io: SocketIOServer | null = null;
  public static readonly SALA_PEDIDO_TICKET = 'sala_pedido_ticket';
  public static readonly SALA_DISPONIBILIDAD_PRODUCTO = 'sala_disponibilidad_producto';

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

      if (usuario.rol === Rol.COCINA || usuario.rol === Rol.CAJA) {
        socket.join(this.SALA_PEDIDO_TICKET);
        socket.join(this.SALA_DISPONIBILIDAD_PRODUCTO);
      } else if (usuario.rol === Rol.ADMIN) {
        socket.join(this.SALA_DISPONIBILIDAD_PRODUCTO);
      }

      socket.on('disconnect', () => {});
    });
  }

  notificarNuevoTicket(ticket: TicketCocina): void {
    SocketService.emitirTicketNuevo(ticket);
  }

  notificarTicketActualizado(data: { ticket_id: number; pedido_id: number; estado: string }): void {
    SocketService.emitirTicketActualizado(data);
  }

  notificarCambioDisponibilidad(data: { producto_id: number; disponible: boolean; nombre?: string }): void {
    SocketService.emitirCambioDisponibilidad(data);
  }

  static emitirTicketNuevo(ticket: TicketCocina): void {
    if (!this.io) return;
    this.io.to(this.SALA_PEDIDO_TICKET).emit('ticket_nuevo', ticket);
  }

  static emitirTicketActualizado(data: { ticket_id: number; pedido_id: number; estado: string }): void {
    if (!this.io) return;
    this.io.emit('ticket_actualizado', data);
  }

  static emitirCambioDisponibilidad(data: { producto_id: number; disponible: boolean; nombre?: string }): void {
    if (!this.io) return;
    this.io.to(this.SALA_DISPONIBILIDAD_PRODUCTO).emit('producto_disponibilidad_cambiada', data);
  }
}
