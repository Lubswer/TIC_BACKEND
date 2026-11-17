import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import {
  IPrediccionRepository,
  FiltrosHistoricoPrediccion,
} from '../../../domain/repositories/IPrediccionRepository.js';
import { ProductoHistoricoParaIADTO } from '../../../application/dtos/prediccion.dto.js';

export class PrediccionMySqlRepository implements IPrediccionRepository {
  async obtenerHistoricoParaPrediccion(
    filtros: FiltrosHistoricoPrediccion = {}
  ): Promise<ProductoHistoricoParaIADTO[]> {
    const ventanaDias = filtros.ventanaDias && filtros.ventanaDias > 0 ? filtros.ventanaDias : 90;
    const condiciones: string[] = [
      'prod.activo = 1',
      'p.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL ? DAY)',
      'p.fecha_creacion < CURDATE()',
    ];
    const params: any[] = [ventanaDias];

    if (filtros.productoId) {
      condiciones.push('prod.id = ?');
      params.push(filtros.productoId);
    }

    if (filtros.categoria) {
      condiciones.push('prod.categoria = ?');
      params.push(filtros.categoria);
    }

    const query = `
      SELECT
        prod.id AS producto_id,
        prod.nombre,
        prod.categoria,
        prod.producto_temporada,
        DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d') AS fecha,
        CAST(SUM(pp.cantidad) AS UNSIGNED) AS cantidad_vendida
      FROM producto_pedido pp
      INNER JOIN pedido p ON pp.pedido_id = p.id
      INNER JOIN producto prod ON pp.producto_id = prod.id
      WHERE ${condiciones.join(' AND ')}
      GROUP BY
        prod.id,
        prod.nombre,
        prod.categoria,
        prod.producto_temporada,
        DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d')
      ORDER BY prod.id ASC, fecha ASC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);
    const mapaProductos = new Map<number, ProductoHistoricoParaIADTO>();

    for (const fila of filas) {
      const productoId = Number(fila.producto_id);
      let entrada = mapaProductos.get(productoId);

      if (!entrada) {
        entrada = {
          producto_id: productoId,
          nombre: String(fila.nombre),
          categoria: String(fila.categoria),
          producto_temporada: Boolean(fila.producto_temporada),
          historial: [],
        };
        mapaProductos.set(productoId, entrada);
      }

      entrada.historial.push({
        fecha: String(fila.fecha),
        cantidad: Number(fila.cantidad_vendida || 0),
      });
    }

    return Array.from(mapaProductos.values());
  }
}
