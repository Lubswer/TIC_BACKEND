export class ProductoPedido {
  id?: number;
  pedido_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  notas: string | null;
  fecha_creacion?: Date;
  nombre_producto?: string;

  constructor(
    producto_id: number,
    cantidad: number,
    precio_unitario: number,
    notas: string | null = null,
    id?: number,
    pedido_id?: number,
    fecha_creacion?: Date,
    nombre_producto?: string
  ) {
    this.id = id;
    this.pedido_id = pedido_id;
    this.producto_id = producto_id;
    this.cantidad = cantidad;
    this.precio_unitario = precio_unitario;
    this.notas = notas;
    this.fecha_creacion = fecha_creacion;
    this.nombre_producto = nombre_producto;
  }

  calcularSubtotal(): number {
    return Number((this.cantidad * this.precio_unitario).toFixed(2));
  }
}

