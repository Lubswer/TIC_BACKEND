import { TicketCocina } from '../../domain/repositories/ITicketRepository.js';

export interface INotificadorTiempoReal {
  notificarNuevoTicket(ticket: TicketCocina): void;
  notificarTicketActualizado(data: { ticket_id: number; pedido_id: number; estado: string }): void;
  notificarCambioDisponibilidad(data: { producto_id: number; disponible: boolean; nombre?: string }): void;
}

