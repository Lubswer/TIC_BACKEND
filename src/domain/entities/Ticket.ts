import { EstadoTicket } from '../enums/EstadoTicket.js';

export class Ticket {
  id?: number;
  pedido_id: number;
  estado: EstadoTicket;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;

  constructor(
    pedido_id: number,
    estado: EstadoTicket = EstadoTicket.PENDIENTE,
    id?: number,
    fecha_creacion?: Date,
    fecha_actualizacion?: Date
  ) {
    this.id = id;
    this.pedido_id = pedido_id;
    this.estado = estado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
  }

  iniciarPreparacion(): void {
    if (this.estado !== EstadoTicket.PENDIENTE) {
      throw new Error(`Solo se puede iniciar la preparación de un ticket que esté 'pendiente'. Estado actual: '${this.estado}'.`);
    }
    this.estado = EstadoTicket.EN_PREPARACION;
  }

  marcarComoListo(): void {
    if (this.estado !== EstadoTicket.EN_PREPARACION) {
      throw new Error(`Solo se puede marcar como listo un ticket que esté 'en_preparacion'. Estado actual: '${this.estado}'.`);
    }
    this.estado = EstadoTicket.LISTO;
  }

  cambiarEstado(nuevoEstado: EstadoTicket): void {
    if (nuevoEstado === EstadoTicket.EN_PREPARACION) {
      this.iniciarPreparacion();
    } else if (nuevoEstado === EstadoTicket.LISTO) {
      this.marcarComoListo();
    } else {
      throw new Error(`Transición no permitida hacia el estado '${nuevoEstado}'.`);
    }
  }
}

