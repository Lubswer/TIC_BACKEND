import { ITicketRepository } from '../../../domain/repositories/ITicketRepository.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';
import { Ticket } from '../../../domain/entities/Ticket.js';

export class CambiarEstadoTicketUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

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

    return ticket;
  }
}
