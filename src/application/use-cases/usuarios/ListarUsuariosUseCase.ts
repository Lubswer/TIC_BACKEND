import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { UsuarioResumenDTO } from '../../dtos/auth.dto.js';

export class ListarUsuariosUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(incluirInactivos: boolean = false): Promise<UsuarioResumenDTO[]> {
    const usuarios = await this.usuarioRepository.listar(incluirInactivos);

    return usuarios.map((u) => ({
      id: u.id!,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
      fecha_creacion: u.fecha_creacion,
      fecha_actualizacion: u.fecha_actualizacion,
    }));
  }
}

