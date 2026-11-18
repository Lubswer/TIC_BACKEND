export interface FiltroFechasDTO {
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
  ultimosDias?: number;
}

export interface TopProductoDTO {
  producto_id: number;
  nombre: string;
  cantidad_total: number;
}

export interface VentasDiariasDTO {
  fecha: string;
  total_ingresos: number;
  cantidad_pedidos: number;
}

export interface ItemVendidoDetalleDTO {
  fecha?: string;
  producto_id: number;
  nombre_producto: string;
  categoria: string;
  cantidad_total: number;
  total_recaudado: number;
  precio_unitario_actual: number;
}

