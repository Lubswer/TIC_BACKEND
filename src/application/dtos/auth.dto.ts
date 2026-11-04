import { Rol } from '../../domain/enums/Rol.js';

export interface RegistroUsuarioDTO {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  email?: string;
  password?: string;
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
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface AuthRespuestaDTO {
  token: string;
  usuario: UsuarioResumenDTO;
}
