import { Request, Response } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware.js';
import { RegistrarIncidenciaUseCase } from '../../../application/use-cases/incidencias/RegistrarIncidenciaUseCase.js';
import { ListarIncidenciasUseCase } from '../../../application/use-cases/incidencias/ListarIncidenciasUseCase.js';
import { ListarIncidenciasPorUsuarioUseCase } from '../../../application/use-cases/incidencias/ListarIncidenciasPorUsuarioUseCase.js';
import { CrearIncidenciaDTO } from '../../../application/dtos/incidencia.dto.js';

export class IncidenciaController {
  constructor(
    private registrarIncidenciaUseCase: RegistrarIncidenciaUseCase,
    private listarIncidenciasUseCase: ListarIncidenciasUseCase,
    private listarIncidenciasPorUsuarioUseCase: ListarIncidenciasPorUsuarioUseCase
  ) {}

  registrar = async (req: RequestAutenticado, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'No se pudo identificar al usuario desde el token.' });
        return;
      }

      const dto: CrearIncidenciaDTO = req.body;
      const incidencia = await this.registrarIncidenciaUseCase.ejecutar(dto, usuarioId);

      res.status(201).json(incidencia);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al registrar la incidencia.' });
    }
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin, limite } = req.query;

      const incidencias = await this.listarIncidenciasUseCase.ejecutar({
        fechaInicio: fechaInicio ? String(fechaInicio) : undefined,
        fechaFin: fechaFin ? String(fechaFin) : undefined,
        limite: limite ? Number(limite) : undefined,
      });

      res.status(200).json(incidencias);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar incidencias.' });
    }
  };

  listarPorUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = Number(req.params.usuarioId);

      if (isNaN(usuarioId) || usuarioId <= 0) {
        res.status(400).json({ error: 'El ID de usuario proporcionado no es válido.' });
        return;
      }

      const incidencias = await this.listarIncidenciasPorUsuarioUseCase.ejecutar(usuarioId);
      res.status(200).json(incidencias);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar incidencias por usuario.' });
    }
  };
}
