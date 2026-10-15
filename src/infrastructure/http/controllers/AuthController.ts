import { Request, Response } from 'express';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { RegistroUsuarioDTO, LoginDTO } from '../../../application/dtos/auth.dto.js';

export class AuthController {
  constructor(
    private registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private loginUseCase: LoginUseCase
  ) {}


  registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        res.status(400).json({
          error: 'Faltan campos obligatorios: nombre, email, password y rol son requeridos.',
        });
        return;
      }

      const dto: RegistroUsuarioDTO = { nombre, email, password, rol };
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
}
