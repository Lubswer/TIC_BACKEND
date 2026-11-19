import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { ActualizarMiPerfilDTO, UsuarioResumenDTO } from '../../dtos/auth.dto.js';

export class ActualizarMiPerfilUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(usuarioId: number, dto: ActualizarMiPerfilDTO): Promise<UsuarioResumenDTO> {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    const tieneNombre = Boolean(dto.nombre && dto.nombre.trim().length > 0);
    const tieneNuevaPassword = Boolean(dto.nuevaPassword && dto.nuevaPassword.trim().length > 0);

    if (!tieneNombre && !tieneNuevaPassword) {
      throw new Error('Debes enviar al menos un campo para actualizar (nombre o nuevaPassword).');
    }

    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario || usuario.estaEliminado()) {
      throw new Error('Usuario no encontrado.');
    }

    if (!usuario.estaHabilitado()) {
      throw new Error('Tu cuenta se encuentra inactiva o suspendida.');
    }

    if (tieneNombre) {
      usuario.nombre = dto.nombre!.trim();
    }

    if (tieneNuevaPassword) {
      if (!dto.passwordActual || dto.passwordActual.trim().length === 0) {
        throw new Error('Debes proporcionar tu contraseña actual para cambiar la contraseña.');
      }

      const passwordActualValida = await usuario.verificarPassword(dto.passwordActual);
      if (!passwordActualValida) {
        throw new Error('La contraseña actual es incorrecta.');
      }

      const nuevaLimpia = dto.nuevaPassword!.trim();
      if (nuevaLimpia.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
      }

      if (nuevaLimpia === dto.passwordActual) {
        throw new Error('La nueva contraseña debe ser diferente a la contraseña actual.');
      }

      usuario.password_hash = await Usuario.hashearPassword(nuevaLimpia);
    }

    const actualizado = await this.usuarioRepository.actualizar(usuario);

    return {
      id: actualizado.id!,
      nombre: actualizado.nombre,
      email: actualizado.email,
      rol: actualizado.rol,
      activo: actualizado.activo,
      eliminado: actualizado.eliminado,
      fecha_creacion: actualizado.fecha_creacion,
      fecha_actualizacion: actualizado.fecha_actualizacion,
    };
  }
}
