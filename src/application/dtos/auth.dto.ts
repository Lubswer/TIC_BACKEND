import { Rol } from '../../domain/enums/Rol.js';

export interface RegistroUsuarioDTO {
  nombre: string;
  email: string;
  password: string; 
  rol: Rol;
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
}

export interface AuthRespuestaDTO {
  token: string;              
  usuario: UsuarioResumenDTO; 
}
