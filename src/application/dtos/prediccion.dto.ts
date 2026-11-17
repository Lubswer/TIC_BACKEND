export type EstrategiaPrediccion =
  | 'auto_ets'
  | 'temporada'
  | 'pocos_datos'
  | 'respaldo_local';

export interface RegistroHistoricoProductoDTO {
  fecha: string;
  cantidad: number;
}

export interface ProductoHistoricoParaIADTO {
  producto_id: number;
  nombre: string;
  categoria: string;
  producto_temporada: boolean;
  historial: RegistroHistoricoProductoDTO[];
}

export interface PrediccionDiaDTO {
  fecha: string;
  cantidad_esperada: number;
  minimo: number;
  maximo: number;
}

export interface PrediccionProductoDTO {
  producto_id: number;
  nombre_producto: string;
  categoria: string;
  producto_temporada: boolean;
  estrategia: EstrategiaPrediccion;
  total_esperado: number;
  predicciones: PrediccionDiaDTO[];
}

export interface FiltrosPrediccionDTO {
  dias?: number;
  productoId?: number;
  categoria?: string;
  limite?: number;
}

export interface RespuestaPrediccionDTO {
  motor: string;
  modelo_activo: boolean;
  dias_predichos: number;
  fecha_corte: string;
  productos: PrediccionProductoDTO[];
}
