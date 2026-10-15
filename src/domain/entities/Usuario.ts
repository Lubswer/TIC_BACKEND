import bcrypt from 'bcryptjs';
import { Rol } from '../enums/Rol.js';

export class Usuario {
  id?: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;

  constructor(
    nombre: string,
    email: string,
    password_hash: string,
    rol: Rol,
    activo: boolean = true,
    id?: number,
    fecha_creacion?: Date,
    fecha_actualizacion?: Date
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password_hash = password_hash;
    this.rol = rol;
    this.activo = activo;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
  }

  static async hashearPassword(passwordPlano: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(passwordPlano, salt);
  }


  async verificarPassword(passwordPlano: string): Promise<boolean> {
    return bcrypt.compare(passwordPlano, this.password_hash);
  }

  
  estaHabilitado(): boolean {
    return this.activo;
  }
}
