import { IIncidenciaRepository } from '../../../domain/repositories/IIncidenciaRepository.js';
import { Incidencia } from '../../../domain/entities/Incidencia.js';
import { CrearIncidenciaDTO, IncidenciaResumenDTO } from '../../dtos/incidencia.dto.js';

export class RegistrarIncidenciaUseCase {
  constructor(private incidenciaRepository: IIncidenciaRepository) {}

  async ejecutar(dto: CrearIncidenciaDTO, usuarioId: number): Promise<IncidenciaResumenDTO> {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    if (!dto.descripcion || dto.descripcion.trim().length === 0) {
      throw new Error('La descripción de la incidencia es obligatoria.');
    }

    const nuevaIncidencia = new Incidencia(
      usuarioId,
      dto.descripcion.trim()
    );

    const guardada = await this.incidenciaRepository.crear(nuevaIncidencia);

    return {
      id: guardada.id!,
      usuario_id: guardada.usuario_id,
      usuario_nombre: guardada.usuario_nombre,
      descripcion: guardada.descripcion,
      fecha_creacion: guardada.fecha_creacion!,
    };
  }
}
