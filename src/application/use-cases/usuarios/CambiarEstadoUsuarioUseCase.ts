import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { UsuarioResumenDTO } from '../../dtos/auth.dto.js';

export class CambiarEstadoUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(
    id: number,
    activo: boolean,
    usuarioAutenticadoId: number
  ): Promise<UsuarioResumenDTO> {
    if (!id || id <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    if (id === usuarioAutenticadoId && !activo) {
      throw new Error('Un administrador no puede suspender su propia cuenta.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado.`);
    }

    if (usuario.estaEliminado()) {
      throw new Error('No se puede cambiar el estado de un usuario que ha sido dado de baja.');
    }

    await this.usuarioRepository.cambiarEstadoActivo(id, activo);
    const actualizado = await this.usuarioRepository.buscarPorId(id);

    return {
      id: actualizado!.id!,
      nombre: actualizado!.nombre,
      email: actualizado!.email,
      rol: actualizado!.rol,
      activo: actualizado!.activo,
      eliminado: actualizado!.eliminado,
      fecha_creacion: actualizado!.fecha_creacion,
      fecha_actualizacion: actualizado!.fecha_actualizacion,
    };
  }
}

