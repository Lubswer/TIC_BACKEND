import { IIncidenciaRepository } from '../../../domain/repositories/IIncidenciaRepository.js';
import { FiltrosIncidenciaDTO, IncidenciaResumenDTO } from '../../dtos/incidencia.dto.js';

export class ListarIncidenciasUseCase {
  constructor(private incidenciaRepository: IIncidenciaRepository) {}

  async ejecutar(filtros: FiltrosIncidenciaDTO = {}): Promise<IncidenciaResumenDTO[]> {
    const incidencias = await this.incidenciaRepository.listar(filtros);

    return incidencias.map((i) => ({
      id: i.id!,
      usuario_id: i.usuario_id,
      usuario_nombre: i.usuario_nombre,
      descripcion: i.descripcion,
      fecha_creacion: i.fecha_creacion!,
    }));
  }
}
