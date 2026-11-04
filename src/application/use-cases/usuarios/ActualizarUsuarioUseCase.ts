import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { ActualizarUsuarioDTO, UsuarioResumenDTO } from '../../dtos/auth.dto.js';

export class ActualizarUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(id: number, dto: ActualizarUsuarioDTO): Promise<UsuarioResumenDTO> {
    if (!id || id <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado.`);
    }

    if (dto.nombre && dto.nombre.trim().length > 0) {
      usuario.nombre = dto.nombre.trim();
    }

    if (dto.email && dto.email.trim().length > 0) {
      const emailLimpio = dto.email.trim().toLowerCase();

      if (emailLimpio !== usuario.email) {
        const existente = await this.usuarioRepository.buscarPorEmail(emailLimpio);
        if (existente && existente.id !== id) {
          throw new Error(`Ya existe otro usuario registrado con el correo '${emailLimpio}'.`);
        }
        usuario.email = emailLimpio;
      }
    }

    if (dto.password && dto.password.trim().length > 0) {
      if (dto.password.trim().length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
      }
      usuario.password_hash = await Usuario.hashearPassword(dto.password.trim());
    }

    const actualizado = await this.usuarioRepository.actualizar(usuario);

    return {
      id: actualizado.id!,
      nombre: actualizado.nombre,
      email: actualizado.email,
      rol: actualizado.rol,
      activo: actualizado.activo,
      fecha_creacion: actualizado.fecha_creacion,
      fecha_actualizacion: actualizado.fecha_actualizacion,
    };
  }
}

