import { ITicketRepository } from '../../../domain/repositories/ITicketRepository.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';
import { Ticket } from '../../../domain/entities/Ticket.js';
import { INotificadorTiempoReal } from '../../services/INotificadorTiempoReal.js';

export class CambiarEstadoTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private notificadorTiempoReal?: INotificadorTiempoReal
  ) {}

  async ejecutar(ticketId: number, nuevoEstado: EstadoTicket): Promise<Ticket> {
    if (!ticketId || ticketId <= 0) {
      throw new Error('ID de ticket inválido.');
    }

    if (!Object.values(EstadoTicket).includes(nuevoEstado)) {
      throw new Error(`Estado no válido. Los estados permitidos son: ${Object.values(EstadoTicket).join(', ')}.`);
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);

    if (!ticket) {
      throw new Error(`Ticket con ID ${ticketId} no encontrado.`);
    }

    ticket.cambiarEstado(nuevoEstado);
    await this.ticketRepository.actualizarEstado(ticketId, nuevoEstado);

    if (this.notificadorTiempoReal) {
      try {
        this.notificadorTiempoReal.notificarTicketActualizado({
          ticket_id: ticket.id!,
          pedido_id: ticket.pedido_id,
          estado: ticket.estado,
        });
      } catch (notifError) {
        console.error('Error no bloqueante al notificar actualización de ticket:', notifError);
      }
    }

    return ticket;
  }
}
