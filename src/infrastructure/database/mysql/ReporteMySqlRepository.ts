import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import {
  IReporteRepository,
  FiltrosReporteVentas,
} from '../../../domain/repositories/IReporteRepository.js';
import {
  TopProductoDTO,
  VentasDiariasDTO,
  ItemVendidoDetalleDTO,
  FiltroFechasDTO,
} from '../../../application/dtos/reporte.dto.js';

export class ReporteMySqlRepository implements IReporteRepository {
  async obtenerTopProductos(filtros: FiltroFechasDTO): Promise<TopProductoDTO[]> {
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 10;
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.fechaInicio) {
      condiciones.push('p.fecha_creacion >= ?');
      params.push(`${filtros.fechaInicio} 00:00:00`);
    }

    if (filtros.fechaFin) {
      condiciones.push('p.fecha_creacion <= ?');
      params.push(`${filtros.fechaFin} 23:59:59`);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const query = `
      SELECT 
        pp.producto_id,
        prod.nombre,
        CAST(SUM(pp.cantidad) AS UNSIGNED) AS cantidad_total
      FROM producto_pedido pp
      INNER JOIN pedido p ON pp.pedido_id = p.id
      INNER JOIN producto prod ON pp.producto_id = prod.id
      ${whereClause}
      GROUP BY pp.producto_id, prod.nombre
      ORDER BY cantidad_total DESC
      LIMIT ?
    `;

    params.push(String(limite));

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);

    return filas.map((fila) => ({
      producto_id: Number(fila.producto_id),
      nombre: String(fila.nombre),
      cantidad_total: Number(fila.cantidad_total || 0),
    }));
  }

  async obtenerVentasDiarias(filtros: FiltroFechasDTO): Promise<VentasDiariasDTO[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.fechaInicio) {
      condiciones.push('fecha_creacion >= ?');
      params.push(`${filtros.fechaInicio} 00:00:00`);
    }

    if (filtros.fechaFin) {
      condiciones.push('fecha_creacion <= ?');
      params.push(`${filtros.fechaFin} 23:59:59`);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const query = `
      SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha,
        ROUND(CAST(SUM(total) AS DECIMAL(10,2)), 2) AS total_ingresos,
        CAST(COUNT(id) AS UNSIGNED) AS cantidad_pedidos
      FROM pedido
      ${whereClause}
      GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m-%d')
      ORDER BY fecha ASC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);

    return filas.map((fila) => ({
      fecha: String(fila.fecha),
      total_ingresos: Number(fila.total_ingresos || 0),
      cantidad_pedidos: Number(fila.cantidad_pedidos || 0),
    }));
  }

  async obtenerProductosVendidos(filtros: FiltrosReporteVentas): Promise<ItemVendidoDetalleDTO[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.fechaInicio) {
      condiciones.push('p.fecha_creacion >= ?');
      params.push(`${filtros.fechaInicio} 00:00:00`);
    }

    if (filtros.fechaFin) {
      condiciones.push('p.fecha_creacion <= ?');
      params.push(`${filtros.fechaFin} 23:59:59`);
    }

    if (filtros.productoId) {
      condiciones.push('pp.producto_id = ?');
      params.push(filtros.productoId);
    }

    if (filtros.categoria) {
      condiciones.push('prod.categoria = ?');
      params.push(filtros.categoria);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const selectFecha = filtros.agruparPorFecha
      ? "DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d') AS fecha,"
      : '';
    const groupByClause = filtros.agruparPorFecha
      ? "GROUP BY DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d'), pp.producto_id, prod.nombre, prod.categoria, prod.precio"
      : 'GROUP BY pp.producto_id, prod.nombre, prod.categoria, prod.precio';
    const orderByClause = filtros.agruparPorFecha
      ? 'ORDER BY fecha DESC, cantidad_total DESC'
      : 'ORDER BY cantidad_total DESC';

    const query = `
      SELECT 
        ${selectFecha}
        pp.producto_id,
        prod.nombre AS nombre_producto,
        prod.categoria,
        prod.precio AS precio_unitario_actual,
        CAST(SUM(pp.cantidad) AS UNSIGNED) AS cantidad_total,
        ROUND(CAST(SUM(pp.total) AS DECIMAL(10,2)), 2) AS total_recaudado
      FROM producto_pedido pp
      INNER JOIN pedido p ON pp.pedido_id = p.id
      INNER JOIN producto prod ON pp.producto_id = prod.id
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);

    return filas.map((fila) => ({
      ...(filtros.agruparPorFecha && fila.fecha ? { fecha: String(fila.fecha) } : {}),
      producto_id: Number(fila.producto_id),
      nombre_producto: String(fila.nombre_producto),
      categoria: String(fila.categoria),
      precio_unitario_actual: Number(fila.precio_unitario_actual || 0),
      cantidad_total: Number(fila.cantidad_total || 0),
      total_recaudado: Number(fila.total_recaudado || 0),
    }));
  }
}

