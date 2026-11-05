import { TicketCocina } from '../../domain/repositories/ITicketRepository.js';

export interface INotificadorCocina {
  notificarNuevoTicket(ticket: TicketCocina): void;
}

