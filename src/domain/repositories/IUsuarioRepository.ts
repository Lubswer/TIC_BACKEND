import { Usuario } from '../entities/Usuario.js';

export interface IUsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;

  buscarPorId(id: number): Promise<Usuario | null>;

  crear(usuario: Usuario): Promise<Usuario>;

  listar(): Promise<Usuario[]>;
}
