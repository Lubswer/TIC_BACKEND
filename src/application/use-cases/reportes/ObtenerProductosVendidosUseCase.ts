import {
  IReporteRepository,
  FiltrosReporteVentas,
} from '../../../domain/repositories/IReporteRepository.js';
import { ItemVendidoDetalleDTO } from '../../dtos/reporte.dto.js';

export class ObtenerProductosVendidosUseCase {
  constructor(private reporteRepository: IReporteRepository) {}

  async ejecutar(filtros: FiltrosReporteVentas = {}): Promise<ItemVendidoDetalleDTO[]> {
    return await this.reporteRepository.obtenerProductosVendidos(filtros);
  }
}

