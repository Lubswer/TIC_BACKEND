import {
  TopProductoDTO,
  VentasDiariasDTO,
  ItemVendidoDetalleDTO,
  FiltroFechasDTO,
} from '../../application/dtos/reporte.dto.js';

export interface FiltrosReporteVentas extends FiltroFechasDTO {
  productoId?: number;
  categoria?: string;
}

export interface IReporteRepository {
  obtenerTopProductos(filtros: FiltroFechasDTO): Promise<TopProductoDTO[]>;
  obtenerVentasDiarias(filtros: FiltroFechasDTO): Promise<VentasDiariasDTO[]>;
  obtenerProductosVendidos(filtros: FiltrosReporteVentas): Promise<ItemVendidoDetalleDTO[]>;
}

