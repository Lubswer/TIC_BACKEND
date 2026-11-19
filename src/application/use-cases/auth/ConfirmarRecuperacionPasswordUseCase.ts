import jwt from 'jsonwebtoken';
import { ENV } from '../../../config/env.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { IEmailService } from '../../services/IEmailService.js';

interface PayloadRecuperacion {
  id: number;
  tipo: string;
}

export class ConfirmarRecuperacionPasswordUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private emailService: IEmailService
  ) {}

  async ejecutar(token: string): Promise<string> {
    if (!token || token.trim().length === 0) {
      throw new Error('Token de recuperación no proporcionado.');
    }

    const decodificado = jwt.decode(token) as PayloadRecuperacion | null;
    if (
      !decodificado ||
      typeof decodificado !== 'object' ||
      !decodificado.id ||
      decodificado.tipo !== 'recuperacion_password'
    ) {
      throw new Error('El enlace de recuperación no es válido.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(decodificado.id);
    if (!usuario || usuario.estaEliminado() || !usuario.estaHabilitado()) {
      throw new Error('La cuenta no existe o no se encuentra habilitada.');
    }

    try {
      jwt.verify(token, ENV.JWT_SECRET + usuario.password_hash);
    } catch {
      throw new Error('El enlace ha expirado o ya fue utilizado.');
    }

    const passwordTemporal = Usuario.generarPasswordTemporal(10);
    const nuevoHash = await Usuario.hashearPassword(passwordTemporal);

    await this.emailService.enviarNuevaPasswordRecuperada({
      nombre: usuario.nombre,
      email: usuario.email,
      passwordTemporal,
    });

    usuario.password_hash = nuevoHash;
    await this.usuarioRepository.actualizar(usuario);

    return usuario.email;
  }
}
