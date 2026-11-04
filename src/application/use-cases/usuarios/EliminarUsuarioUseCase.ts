import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';

export class EliminarUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(id: number, usuarioAutenticadoId: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    if (id === usuarioAutenticadoId) {
      throw new Error('Un administrador no puede desactivar su propia cuenta.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado.`);
    }

    return await this.usuarioRepository.cambiarEstadoActivo(id, false);
  }
}

