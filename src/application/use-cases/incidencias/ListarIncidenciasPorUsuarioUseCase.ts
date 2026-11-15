import { IIncidenciaRepository } from '../../../domain/repositories/IIncidenciaRepository.js';
import { IncidenciaResumenDTO } from '../../dtos/incidencia.dto.js';

export class ListarIncidenciasPorUsuarioUseCase {
  constructor(private incidenciaRepository: IIncidenciaRepository) {}

  async ejecutar(usuarioId: number): Promise<IncidenciaResumenDTO[]> {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    const incidencias = await this.incidenciaRepository.listarPorUsuarioId(usuarioId);

    return incidencias.map((i) => ({
      id: i.id!,
      usuario_id: i.usuario_id,
      usuario_nombre: i.usuario_nombre,
      descripcion: i.descripcion,
      fecha_creacion: i.fecha_creacion!,
    }));
  }
}
