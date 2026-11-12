import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IUsuarioRepository, FiltrosUsuario } from '../../../domain/repositories/IUsuarioRepository.js';
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
      Boolean(fila.eliminado),
      fila.id,
      new Date(fila.fecha_creacion),
      new Date(fila.fecha_actualizacion)
    );
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, email, password_hash, rol, activo, eliminado, fecha_creacion, fecha_actualizacion
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
      SELECT id, nombre, email, password_hash, rol, activo, eliminado, fecha_creacion, fecha_actualizacion
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
      INSERT INTO usuario (nombre, email, password_hash, rol, activo, eliminado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      usuario.nombre,
      usuario.email,
      usuario.password_hash,
      usuario.rol,
      usuario.activo ? 1 : 0,
      usuario.eliminado ? 1 : 0,
    ]);

    const usuarioCreado = await this.buscarPorId(resultado.insertId);
    return usuarioCreado!;
  }

  async actualizar(usuario: Usuario): Promise<Usuario> {
    if (!usuario.id) {
      throw new Error('No se puede actualizar un usuario sin ID.');
    }

    const query = `
      UPDATE usuario
      SET nombre = ?, email = ?, password_hash = ?, activo = ?
      WHERE id = ?
    `;

    await pool.execute<ResultSetHeader>(query, [
      usuario.nombre,
      usuario.email,
      usuario.password_hash,
      usuario.activo ? 1 : 0,
      usuario.id,
    ]);

    const actualizado = await this.buscarPorId(usuario.id);
    return actualizado!;
  }

  async cambiarEstadoActivo(id: number, activo: boolean): Promise<boolean> {
    const query = `
      UPDATE usuario
      SET activo = ?
      WHERE id = ?
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      activo ? 1 : 0,
      id,
    ]);

    return resultado.affectedRows > 0;
  }

  async eliminarLogico(id: number): Promise<boolean> {
    const query = `
      UPDATE usuario
      SET eliminado = 1, activo = 0
      WHERE id = ?
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [id]);
    return resultado.affectedRows > 0;
  }

  async listar(filtros: FiltrosUsuario = {}): Promise<Usuario[]> {
    let query = `
      SELECT id, nombre, email, password_hash, rol, activo, eliminado, fecha_creacion, fecha_actualizacion
      FROM usuario
      WHERE 1=1
    `;

    if (filtros.soloEliminados === true) {
      query += ` AND eliminado = 1 `;
    } else if (!filtros.incluirEliminados) {
      query += ` AND eliminado = 0 `;
    }

    if (filtros.soloActivos === true) {
      query += ` AND activo = 1 `;
    } else if (filtros.soloInactivos === true) {
      query += ` AND activo = 0 `;
    }

    query += ` ORDER BY nombre ASC `;

    const [filas] = await pool.execute<RowDataPacket[]>(query);
    return filas.map((fila) => this.mapearFilaAUsuario(fila));
  }
}
