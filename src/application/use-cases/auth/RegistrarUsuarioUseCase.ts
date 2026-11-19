import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { RegistroUsuarioDTO, UsuarioResumenDTO } from '../../dtos/auth.dto.js';
import { IEmailService } from '../../services/IEmailService.js';

export class RegistrarUsuarioUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private emailService: IEmailService
  ) {}

  async ejecutar(dto: RegistroUsuarioDTO): Promise<UsuarioResumenDTO> {
    const emailLimpio = dto.email.trim().toLowerCase();
    const nombreLimpio = dto.nombre.trim();

    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(emailLimpio);
    if (usuarioExistente) {
      throw new Error(`El correo electrónico '${emailLimpio}' ya está registrado.`);
    }

    const passwordTemporal = Usuario.generarPasswordTemporal(10);
    const passwordHash = await Usuario.hashearPassword(passwordTemporal);

    await this.emailService.enviarBienvenidaConPassword({
      nombre: nombreLimpio,
      email: emailLimpio,
      rol: dto.rol,
      passwordTemporal,
    });

    const nuevoUsuario = new Usuario(
      nombreLimpio,
      emailLimpio,
      passwordHash,
      dto.rol,
      true,
      false
    );

    const usuarioGuardado = await this.usuarioRepository.crear(nuevoUsuario);

    return {
      id: usuarioGuardado.id!,
      nombre: usuarioGuardado.nombre,
      email: usuarioGuardado.email,
      rol: usuarioGuardado.rol,
      activo: usuarioGuardado.activo,
      eliminado: usuarioGuardado.eliminado,
      fecha_creacion: usuarioGuardado.fecha_creacion,
    };
  }
}
