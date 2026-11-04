import { ProductoPedido } from './ProductoPedido.js';

export class Pedido {
  id?: number;
  usuario_id: number;
  total_productos: number;
  total_extras: number;
  descripcion_extras: string | null;
  total: number;
  tipo_pago: string;
  notas: string | null;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  lineas?: ProductoPedido[];

  constructor(
    usuario_id: number,
    total_productos: number,
    total_extras: number,
    descripcion_extras: string | null,
    total: number,
    tipo_pago: string,
    notas: string | null = null,
    id?: number,
    fecha_creacion?: Date,
    fecha_actualizacion?: Date,
    lineas?: ProductoPedido[]
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.total_productos = total_productos;
    this.total_extras = total_extras;
    this.descripcion_extras = descripcion_extras;
    this.total = total;
    this.tipo_pago = tipo_pago;
    this.notas = notas;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.lineas = lineas;
  }
}

