export interface ItemPedidoInputDTO {
  producto_id: number;
  cantidad: number;
  notas?: string | null;
}

export interface CrearPedidoDTO {
  usuario_id: number;
  items: ItemPedidoInputDTO[];
  total_extras?: number;
  descripcion_extras?: string | null;
  tipo_pago: string;
  notas?: string | null;
}

export interface LineaPedidoDetalleDTO {
  id?: number;
  producto_id: number;
  nombre_producto?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string | null;
}

export interface PedidoResumenDTO {
  id: number;
  usuario_id: number;
  total_productos: number;
  total_extras: number;
  descripcion_extras: string | null;
  total: number;
  tipo_pago: string;
  notas: string | null;
  fecha_creacion?: Date;
  lineas?: LineaPedidoDetalleDTO[];
}

