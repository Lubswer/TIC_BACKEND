import { IReporteRepository } from '../../../domain/repositories/IReporteRepository.js';
import { VentasDiariasDTO, FiltroFechasDTO } from '../../dtos/reporte.dto.js';

export class ObtenerVentasDiariasUseCase {
  constructor(private reporteRepository: IReporteRepository) {}

  async ejecutar(filtros: FiltroFechasDTO = {}): Promise<VentasDiariasDTO[]> {
    let { fechaInicio, fechaFin } = filtros;

    if (!fechaInicio && !fechaFin) {
      const hoy = new Date();
      const haceSieteDias = new Date();
      haceSieteDias.setDate(hoy.getDate() - 7);

      fechaInicio = haceSieteDias.toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
    }

    return await this.reporteRepository.obtenerVentasDiarias({
      fechaInicio,
      fechaFin,
    });
  }
}

