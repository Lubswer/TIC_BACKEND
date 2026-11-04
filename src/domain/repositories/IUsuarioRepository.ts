import { Usuario } from '../entities/Usuario.js';

export interface IUsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;

  buscarPorId(id: number): Promise<Usuario | null>;

  crear(usuario: Usuario): Promise<Usuario>;

  actualizar(usuario: Usuario): Promise<Usuario>;

  cambiarEstadoActivo(id: number, activo: boolean): Promise<boolean>;

  listar(incluirInactivos?: boolean): Promise<Usuario[]>;
}
