import { Request, Response } from 'express';
import { ListarUsuariosUseCase } from '../../../application/use-cases/usuarios/ListarUsuariosUseCase.js';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/usuarios/ActualizarUsuarioUseCase.js';
import { EliminarUsuarioUseCase } from '../../../application/use-cases/usuarios/EliminarUsuarioUseCase.js';
import { ActualizarUsuarioDTO } from '../../../application/dtos/auth.dto.js';

export class UsuarioController {
  constructor(
    private listarUsuariosUseCase: ListarUsuariosUseCase,
    private actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
    private eliminarUsuarioUseCase: EliminarUsuarioUseCase
  ) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const incluirInactivos = req.query.incluirInactivos === 'true';
      const usuarios = await this.listarUsuariosUseCase.ejecutar(incluirInactivos);
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

  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const usuarioAutenticadoId = (req as any).usuario?.id;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID de usuario proporcionado no es válido.' });
        return;
      }

      await this.eliminarUsuarioUseCase.ejecutar(id, usuarioAutenticadoId);
      res.status(200).json({ mensaje: `Usuario con ID ${id} desactivado lógicamente con éxito.` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al desactivar usuario.' });
    }
  };
}

