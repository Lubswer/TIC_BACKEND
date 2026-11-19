import { Request, Response } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware.js';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { ActualizarMiPerfilUseCase } from '../../../application/use-cases/auth/ActualizarMiPerfilUseCase.js';
import {
  RegistroUsuarioDTO,
  LoginDTO,
  ActualizarMiPerfilDTO,
} from '../../../application/dtos/auth.dto.js';

export class AuthController {
  constructor(
    private registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private loginUseCase: LoginUseCase,
    private actualizarMiPerfilUseCase: ActualizarMiPerfilUseCase
  ) {}


  registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, email, rol } = req.body;

      if (!nombre || !email || !rol) {
        res.status(400).json({
          error: 'Faltan campos obligatorios: nombre, email y rol son requeridos.',
        });
        return;
      }

      const dto: RegistroUsuarioDTO = { nombre, email, rol };
      const nuevoUsuario = await this.registrarUsuarioUseCase.ejecutar(dto);

      res.status(201).json(nuevoUsuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al registrar usuario.' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Email y password son obligatorios para iniciar sesión.',
        });
        return;
      }

      const dto: LoginDTO = { email, password };
      const authRespuesta = await this.loginUseCase.ejecutar(dto);

      res.status(200).json(authRespuesta);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Error al iniciar sesión.' });
    }
  };

  actualizarMiPerfil = async (req: RequestAutenticado, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'No se pudo identificar al usuario desde el token.' });
        return;
      }

      const dto: ActualizarMiPerfilDTO = req.body;
      const usuarioActualizado = await this.actualizarMiPerfilUseCase.ejecutar(usuarioId, dto);

      res.status(200).json(usuarioActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar el perfil.' });
    }
  };
}
