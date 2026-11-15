import { Incidencia } from '../entities/Incidencia.js';
import { FiltrosIncidenciaDTO } from '../../application/dtos/incidencia.dto.js';

export interface IIncidenciaRepository {
  crear(incidencia: Incidencia): Promise<Incidencia>;
  listar(filtros?: FiltrosIncidenciaDTO): Promise<Incidencia[]>;
  listarPorUsuarioId(usuarioId: number): Promise<Incidencia[]>;
}
