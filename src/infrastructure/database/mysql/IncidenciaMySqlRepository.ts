import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IIncidenciaRepository } from '../../../domain/repositories/IIncidenciaRepository.js';
import { Incidencia } from '../../../domain/entities/Incidencia.js';
import { FiltrosIncidenciaDTO } from '../../../application/dtos/incidencia.dto.js';

export class IncidenciaMySqlRepository implements IIncidenciaRepository {
  async crear(incidencia: Incidencia): Promise<Incidencia> {
    const query = `
      INSERT INTO incidencia (usuario_id, descripcion)
      VALUES (?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      incidencia.usuario_id,
      incidencia.descripcion,
    ]);

    const incidenciaId = resultado.insertId;

    const queryRecuperar = `
      SELECT i.id, i.usuario_id, i.descripcion, i.fecha_creacion, u.nombre AS usuario_nombre
      FROM incidencia i
      INNER JOIN usuario u ON i.usuario_id = u.id
      WHERE i.id = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(queryRecuperar, [incidenciaId]);
    const fila = filas[0];

    return new Incidencia(
      fila.usuario_id,
      fila.descripcion,
      fila.id,
      new Date(fila.fecha_creacion),
      fila.usuario_nombre
    );
  }

  async listar(filtros: FiltrosIncidenciaDTO = {}): Promise<Incidencia[]> {
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 50;
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.fechaInicio) {
      condiciones.push('i.fecha_creacion >= ?');
      params.push(`${filtros.fechaInicio} 00:00:00`);
    }

    if (filtros.fechaFin) {
      condiciones.push('i.fecha_creacion <= ?');
      params.push(`${filtros.fechaFin} 23:59:59`);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const query = `
      SELECT i.id, i.usuario_id, i.descripcion, i.fecha_creacion, u.nombre AS usuario_nombre
      FROM incidencia i
      INNER JOIN usuario u ON i.usuario_id = u.id
      ${whereClause}
      ORDER BY i.fecha_creacion DESC
      LIMIT ?
    `;

    params.push(String(limite));

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);

    return filas.map(
      (fila) =>
        new Incidencia(
          fila.usuario_id,
          fila.descripcion,
          fila.id,
          new Date(fila.fecha_creacion),
          fila.usuario_nombre
        )
    );
  }

  async listarPorUsuarioId(usuarioId: number): Promise<Incidencia[]> {
    const query = `
      SELECT i.id, i.usuario_id, i.descripcion, i.fecha_creacion, u.nombre AS usuario_nombre
      FROM incidencia i
      INNER JOIN usuario u ON i.usuario_id = u.id
      WHERE i.usuario_id = ?
      ORDER BY i.fecha_creacion DESC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [usuarioId]);

    return filas.map(
      (fila) =>
        new Incidencia(
          fila.usuario_id,
          fila.descripcion,
          fila.id,
          new Date(fila.fecha_creacion),
          fila.usuario_nombre
        )
    );
  }
}
