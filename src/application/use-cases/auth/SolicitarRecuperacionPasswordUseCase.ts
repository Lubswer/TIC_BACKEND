import jwt from 'jsonwebtoken';
import { ENV } from '../../../config/env.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { IEmailService } from '../../services/IEmailService.js';
import { OlvidePasswordDTO } from '../../dtos/auth.dto.js';

export class SolicitarRecuperacionPasswordUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private emailService: IEmailService
  ) {}

  async ejecutar(dto: OlvidePasswordDTO): Promise<{ mensaje: string }> {
    const emailLimpio = dto.email.trim().toLowerCase();
    const respuestaGenerica = {
      mensaje: 'Si el correo está registrado, recibirás un enlace de confirmación en tu bandeja.',
    };

    const usuario = await this.usuarioRepository.buscarPorEmail(emailLimpio);
    if (!usuario || usuario.estaEliminado() || !usuario.estaHabilitado()) {
      return respuestaGenerica;
    }

    const token = jwt.sign(
      { id: usuario.id, tipo: 'recuperacion_password' },
      ENV.JWT_SECRET + usuario.password_hash,
      { expiresIn: '15m' }
    );

    const baseUrl = ENV.APP_URL.replace(/\/+$/, '');
    const urlConfirmacion = `${baseUrl}/api/auth/confirmar-recuperacion?token=${encodeURIComponent(token)}`;

    await this.emailService.enviarSolicitudRecuperacion({
      nombre: usuario.nombre,
      email: usuario.email,
      urlConfirmacion,
    });

    return respuestaGenerica;
  }
}
