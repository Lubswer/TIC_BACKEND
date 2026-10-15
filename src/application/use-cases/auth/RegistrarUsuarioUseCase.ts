import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { RegistroUsuarioDTO, UsuarioResumenDTO } from '../../dtos/auth.dto.js';

export class RegistrarUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(dto: RegistroUsuarioDTO): Promise<UsuarioResumenDTO> {

    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (usuarioExistente) {
      throw new Error(`El correo electrónico '${dto.email}' ya está registrado.`);
    }

    const passwordHash = await Usuario.hashearPassword(dto.password);

    const nuevoUsuario = new Usuario(
      dto.nombre,
      dto.email,
      passwordHash,
      dto.rol,
      true 
    );


    const usuarioGuardado = await this.usuarioRepository.crear(nuevoUsuario);

    return {
      id: usuarioGuardado.id!,
      nombre: usuarioGuardado.nombre,
      email: usuarioGuardado.email,
      rol: usuarioGuardado.rol,
      activo: usuarioGuardado.activo,
    };
  }
}
