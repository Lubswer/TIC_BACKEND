import { IReporteRepository } from '../../../domain/repositories/IReporteRepository.js';
import { VentasDiariasDTO, FiltroFechasDTO } from '../../dtos/reporte.dto.js';

export class ObtenerVentasDiariasUseCase {
  constructor(private reporteRepository: IReporteRepository) {}

  async ejecutar(filtros: FiltroFechasDTO = {}): Promise<VentasDiariasDTO[]> {
    let { fechaInicio, fechaFin, ultimosDias } = filtros;

    if (!fechaInicio && !fechaFin && ultimosDias && ultimosDias > 0) {
      const hoy = new Date();
      const inicio = new Date();
      inicio.setDate(hoy.getDate() - ultimosDias);

      fechaInicio = inicio.toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
    }

    return await this.reporteRepository.obtenerVentasDiarias({
      fechaInicio,
      fechaFin,
    });
  }
}

