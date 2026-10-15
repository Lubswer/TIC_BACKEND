import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { Rol } from '../../../domain/enums/Rol.js';

export class UsuarioMySqlRepository implements IUsuarioRepository {
  
  private mapearFilaAUsuario(fila: RowDataPacket): Usuario {
    return new Usuario(
      fila.nombre,
      fila.email,
      fila.password_hash,
      fila.rol as Rol,
      Boolean(fila.activo),
      fila.id,
      new Date(fila.fecha_creacion),
      new Date(fila.fecha_actualizacion)
    );
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, email, password_hash, rol, activo, fecha_creacion, fecha_actualizacion
      FROM usuario
      WHERE email = ?
      LIMIT 1
    `;
    
    const [filas] = await pool.execute<RowDataPacket[]>(query, [email]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaAUsuario(filas[0]);
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, email, password_hash, rol, activo, fecha_creacion, fecha_actualizacion
      FROM usuario
      WHERE id = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaAUsuario(filas[0]);
  }

  async crear(usuario: Usuario): Promise<Usuario> {
    const query = `
      INSERT INTO usuario (nombre, email, password_hash, rol, activo)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      usuario.nombre,
      usuario.email,
      usuario.password_hash,
      usuario.rol,
      usuario.activo ? 1 : 0,
    ]);

    usuario.id = resultado.insertId;
    return usuario;
  }

  async listar(): Promise<Usuario[]> {
    const query = `
      SELECT id, nombre, email, password_hash, rol, activo, fecha_creacion, fecha_actualizacion
      FROM usuario
      ORDER BY id ASC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query);

    return filas.map((fila) => this.mapearFilaAUsuario(fila));
  }
}
