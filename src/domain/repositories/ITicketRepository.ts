import { Ticket } from '../entities/Ticket.js';
import { EstadoTicket } from '../enums/EstadoTicket.js';

export interface ItemTicketCocina {
  producto: string;
  cantidad: number;
  notas: string | null;
}

export interface TicketCocina {
  ticket_id: number;
  pedido_id: number;
  estado: EstadoTicket;
  notas_pedido: string | null;
  descripcion_extras: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  items: ItemTicketCocina[];
}

export interface ITicketRepository {
  buscarPorId(id: number): Promise<Ticket | null>;

  buscarPorPedidoId(pedidoId: number): Promise<Ticket | null>;

  actualizarEstado(id: number, nuevoEstado: EstadoTicket): Promise<boolean>;

  listarTicketsActivos(): Promise<TicketCocina[]>;

  listarTicketsDespachados(limite?: number): Promise<TicketCocina[]>;
}
