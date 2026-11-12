import { IReporteRepository } from '../../../domain/repositories/IReporteRepository.js';
import { TopProductoDTO, FiltroFechasDTO } from '../../dtos/reporte.dto.js';

export class ObtenerTopProductosUseCase {
  constructor(private reporteRepository: IReporteRepository) {}

  async ejecutar(filtros: FiltroFechasDTO = {}): Promise<TopProductoDTO[]> {
    let { fechaInicio, fechaFin, limite } = filtros;

    if (!fechaInicio && !fechaFin) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaInicio = hoy;
      fechaFin = hoy;
    }

    return await this.reporteRepository.obtenerTopProductos({
      fechaInicio,
      fechaFin,
      limite: limite || 10,
    });
  }
}

