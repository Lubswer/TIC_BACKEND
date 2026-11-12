import { Request, Response } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware.js';
import { ListarUsuariosUseCase } from '../../../application/use-cases/usuarios/ListarUsuariosUseCase.js';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/usuarios/ActualizarUsuarioUseCase.js';
import { EliminarUsuarioUseCase } from '../../../application/use-cases/usuarios/EliminarUsuarioUseCase.js';
import { CambiarEstadoUsuarioUseCase } from '../../../application/use-cases/usuarios/CambiarEstadoUsuarioUseCase.js';
import { ActualizarUsuarioDTO } from '../../../application/dtos/auth.dto.js';

export class UsuarioController {
  constructor(
    private listarUsuariosUseCase: ListarUsuariosUseCase,
    private actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
    private eliminarUsuarioUseCase: EliminarUsuarioUseCase,
    private cambiarEstadoUsuarioUseCase: CambiarEstadoUsuarioUseCase
  ) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const soloActivos = req.query.soloActivos === 'true';
      const soloInactivos = req.query.soloInactivos === 'true';
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const soloEliminados = req.query.soloEliminados === 'true';

      const usuarios = await this.listarUsuariosUseCase.ejecutar({
        soloActivos: soloActivos ? true : undefined,
        soloInactivos: soloInactivos ? true : undefined,
        incluirEliminados: incluirEliminados ? true : undefined,
        soloEliminados: soloEliminados ? true : undefined,
      });

      res.status(200).json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar usuarios.' });
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID de usuario proporcionado no es válido.' });
        return;
      }

      const dto: ActualizarUsuarioDTO = req.body;
      const usuarioActualizado = await this.actualizarUsuarioUseCase.ejecutar(id, dto);
      res.status(200).json(usuarioActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar usuario.' });
    }
  };

  cambiarEstado = async (req: RequestAutenticado, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const usuarioAutenticadoId = req.usuario?.id;
      const { activo } = req.body;

      if (!usuarioAutenticadoId) {
        res.status(401).json({ error: 'No se pudo identificar al usuario administrador desde el token.' });
        return;
      }

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID de usuario proporcionado no es válido.' });
        return;
      }

      if (typeof activo !== 'boolean') {
        res.status(400).json({ error: "El campo 'activo' es obligatorio y debe ser un booleano (true o false)." });
        return;
      }

      const actualizado = await this.cambiarEstadoUsuarioUseCase.ejecutar(id, activo, usuarioAutenticadoId);
      res.status(200).json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al cambiar estado del usuario.' });
    }
  };

  eliminar = async (req: RequestAutenticado, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const usuarioAutenticadoId = req.usuario?.id;

      if (!usuarioAutenticadoId) {
        res.status(401).json({ error: 'No se pudo identificar al usuario administrador desde el token.' });
        return;
      }

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID de usuario proporcionado no es válido.' });
        return;
      }

      await this.eliminarUsuarioUseCase.ejecutar(id, usuarioAutenticadoId);
      res.status(200).json({ mensaje: `Usuario con ID ${id} dado de baja (eliminado lógicamente) con éxito.` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al dar de baja al usuario.' });
    }
  };
}

