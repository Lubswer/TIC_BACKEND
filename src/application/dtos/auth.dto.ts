import { Rol } from '../../domain/enums/Rol.js';

export interface RegistroUsuarioDTO {
  nombre: string;
  email: string;
  rol: Rol;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  email?: string;
  password?: string;
  activo?: boolean;
}

export interface ActualizarMiPerfilDTO {
  nombre?: string;
  passwordActual?: string;
  nuevaPassword?: string;
}

export interface OlvidePasswordDTO {
  email: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UsuarioResumenDTO {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  eliminado: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface AuthRespuestaDTO {
  token: string;
  usuario: UsuarioResumenDTO;
}
