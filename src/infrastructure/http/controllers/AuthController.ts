import { Request, Response } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware.js';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { ActualizarMiPerfilUseCase } from '../../../application/use-cases/auth/ActualizarMiPerfilUseCase.js';
import { SolicitarRecuperacionPasswordUseCase } from '../../../application/use-cases/auth/SolicitarRecuperacionPasswordUseCase.js';
import { ConfirmarRecuperacionPasswordUseCase } from '../../../application/use-cases/auth/ConfirmarRecuperacionPasswordUseCase.js';
import {
  RegistroUsuarioDTO,
  LoginDTO,
  ActualizarMiPerfilDTO,
  OlvidePasswordDTO,
} from '../../../application/dtos/auth.dto.js';

export class AuthController {
  constructor(
    private registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private loginUseCase: LoginUseCase,
    private actualizarMiPerfilUseCase: ActualizarMiPerfilUseCase,
    private solicitarRecuperacionPasswordUseCase: SolicitarRecuperacionPasswordUseCase,
    private confirmarRecuperacionPasswordUseCase: ConfirmarRecuperacionPasswordUseCase
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

  olvidePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        res.status(400).json({ error: 'El email es obligatorio.' });
        return;
      }

      const dto: OlvidePasswordDTO = { email };
      const resultado = await this.solicitarRecuperacionPasswordUseCase.ejecutar(dto);

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud.' });
    }
  };

  private renderHtmlConfirmacion(titulo: string, mensaje: string, esError: boolean = false): string {
    const color = esError ? '#b91c1c' : '#4A2C2A';
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${titulo} — Heladería Ciocolatto</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #faf5f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0;">
          <div style="background: #ffffff; max-width: 460px; padding: 32px; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); text-align: center; border-top: 6px solid ${color};">
            <h2 style="color: ${color}; margin-top: 0;">${titulo}</h2>
            <p style="color: #333333; line-height: 1.6;">${mensaje}</p>
          </div>
        </body>
      </html>
    `;
  }

  confirmarRecuperacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.query.token ? String(req.query.token) : '';
      const email = await this.confirmarRecuperacionPasswordUseCase.ejecutar(token);

      res
        .status(200)
        .send(
          this.renderHtmlConfirmacion(
            '¡Contraseña restablecida!',
            `Hemos enviado una nueva contraseña temporal a <strong>${email}</strong>. Revisa tu bandeja de entrada, inicia sesión y cámbiala desde tu perfil.`
          )
        );
    } catch (error: any) {
      res
        .status(400)
        .send(
          this.renderHtmlConfirmacion(
            'Enlace inválido o expirado',
            error.message || 'No se pudo restablecer la contraseña. Solicita un nuevo enlace desde el inicio de sesión.',
            true
          )
        );
    }
  };
}
