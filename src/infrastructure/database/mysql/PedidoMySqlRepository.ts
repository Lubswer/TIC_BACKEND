import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IPedidoRepository, FiltrosPedido } from '../../../domain/repositories/IPedidoRepository.js';
import { Pedido } from '../../../domain/entities/Pedido.js';
import { ProductoPedido } from '../../../domain/entities/ProductoPedido.js';
import { TransactionManager } from '../TransactionManager.js';

export class PedidoMySqlRepository implements IPedidoRepository {

  async crearConLineas(pedido: Pedido, lineas: ProductoPedido[]): Promise<Pedido> {
    return await TransactionManager.ejecutar(async (conexion) => {
      const queryPedido = `
        INSERT INTO pedido (
          usuario_id,
          total_productos,
          total_extras,
          descripcion_extras,
          extras,
          total,
          tipo_pago,
          notas
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [resultadoPedido] = await conexion.execute<ResultSetHeader>(queryPedido, [
        pedido.usuario_id,
        pedido.total_productos,
        pedido.total_extras,
        pedido.descripcion_extras ?? null,
        pedido.extras ? 1 : 0,
        pedido.total,
        pedido.tipo_pago,
        pedido.notas ?? null,
      ]);

      const pedidoId = resultadoPedido.insertId;

      const queryLinea = `
        INSERT INTO producto_pedido (
          pedido_id,
          producto_id,
          cantidad,
          precio_unitario,
          total,
          notas
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const queryDescontarStock = `
        UPDATE producto
        SET 
          stock = stock - ?,
          disponible = CASE 
            WHEN (stock - ?) <= 0 THEN 0 
            ELSE disponible 
          END
        WHERE id = ? AND stock IS NOT NULL
      `;

      for (const linea of lineas) {
        await conexion.execute<ResultSetHeader>(queryLinea, [
          pedidoId,
          linea.producto_id,
          linea.cantidad,
          linea.precio_unitario,
          linea.total,
          linea.notas ?? null,
        ]);

        await conexion.execute<ResultSetHeader>(queryDescontarStock, [
          linea.cantidad,
          linea.cantidad,
          linea.producto_id,
        ]);
      }

      const queryTicket = `
        INSERT INTO ticket (pedido_id, estado)
        VALUES (?, 'pendiente')
      `;

      const [resultadoTicket] = await conexion.execute<ResultSetHeader>(queryTicket, [pedidoId]);

      const pedidoCreado = await this.buscarPorIdConConexion(conexion, pedidoId);
      if (pedidoCreado) {
        pedidoCreado.ticket_id = resultadoTicket.insertId;
      }
      return pedidoCreado!;
    });
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const conexion = pool;

    const queryPedido = `
      SELECT 
        p.id, 
        p.usuario_id, 
        u.nombre AS usuario_nombre,
        p.total_productos, 
        p.total_extras, 
        p.descripcion_extras, 
        p.extras, 
        p.total, 
        p.tipo_pago, 
        p.notas, 
        p.fecha_creacion, 
        p.fecha_actualizacion
      FROM pedido p
      INNER JOIN usuario u ON p.usuario_id = u.id
      WHERE p.id = ?
      LIMIT 1
    `;

    const [filasPedido] = await conexion.execute<RowDataPacket[]>(queryPedido, [id]);

    if (filasPedido.length === 0) {
      return null;
    }

    const filaP = filasPedido[0];

    const queryLineas = `
      SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.total, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
      FROM producto_pedido pp
      INNER JOIN producto p ON pp.producto_id = p.id
      WHERE pp.pedido_id = ?
      ORDER BY pp.id ASC
    `;

    const [filasLineas] = await conexion.execute<RowDataPacket[]>(queryLineas, [id]);

    const lineas: ProductoPedido[] = filasLineas.map(
      (f) =>
        new ProductoPedido(
          f.producto_id,
          Number(f.cantidad),
          Number(f.precio_unitario),
          f.notas,
          Number(f.total),
          f.id,
          f.pedido_id,
          new Date(f.fecha_creacion),
          f.nombre_producto
        )
    );

    return new Pedido(
      filaP.usuario_id,
      Number(filaP.total_productos),
      Number(filaP.total_extras),
      filaP.descripcion_extras,
      Boolean(filaP.extras),
      Number(filaP.total),
      filaP.tipo_pago,
      filaP.notas,
      filaP.id,
      new Date(filaP.fecha_creacion),
      new Date(filaP.fecha_actualizacion),
      lineas,
      undefined,
      filaP.usuario_nombre
    );
  }

  private async buscarPorIdConConexion(conexion: any, id: number): Promise<Pedido | null> {
    const queryPedido = `
      SELECT 
        p.id, 
        p.usuario_id, 
        u.nombre AS usuario_nombre,
        p.total_productos, 
        p.total_extras, 
        p.descripcion_extras, 
        p.extras, 
        p.total, 
        p.tipo_pago, 
        p.notas, 
        p.fecha_creacion, 
        p.fecha_actualizacion
      FROM pedido p
      INNER JOIN usuario u ON p.usuario_id = u.id
      WHERE p.id = ?
      LIMIT 1
    `;

    const [filasPedido] = await conexion.execute(queryPedido, [id]);

    if (filasPedido.length === 0) {
      return null;
    }

    const filaP = filasPedido[0];

    const queryLineas = `
      SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.total, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
      FROM producto_pedido pp
      INNER JOIN producto p ON pp.producto_id = p.id
      WHERE pp.pedido_id = ?
      ORDER BY pp.id ASC
    `;

    const [filasLineas] = await conexion.execute(queryLineas, [id]);

    const lineas: ProductoPedido[] = filasLineas.map(
      (f: any) =>
        new ProductoPedido(
          f.producto_id,
          Number(f.cantidad),
          Number(f.precio_unitario),
          f.notas,
          Number(f.total),
          f.id,
          f.pedido_id,
          new Date(f.fecha_creacion),
          f.nombre_producto
        )
    );

    return new Pedido(
      filaP.usuario_id,
      Number(filaP.total_productos),
      Number(filaP.total_extras),
      filaP.descripcion_extras,
      Boolean(filaP.extras),
      Number(filaP.total),
      filaP.tipo_pago,
      filaP.notas,
      filaP.id,
      new Date(filaP.fecha_creacion),
      new Date(filaP.fecha_actualizacion),
      lineas,
      undefined,
      filaP.usuario_nombre
    );
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Pedido[]> {
    const queryPedidos = `
      SELECT 
        p.id, 
        p.usuario_id, 
        u.nombre AS usuario_nombre,
        p.total_productos, 
        p.total_extras, 
        p.descripcion_extras, 
        p.extras, 
        p.total, 
        p.tipo_pago, 
        p.notas, 
        p.fecha_creacion, 
        p.fecha_actualizacion
      FROM pedido p
      INNER JOIN usuario u ON p.usuario_id = u.id
      WHERE p.usuario_id = ?
      ORDER BY p.fecha_creacion DESC
    `;

    const [filasPedidos] = await pool.execute<RowDataPacket[]>(queryPedidos, [usuarioId]);

    if (filasPedidos.length === 0) {
      return [];
    }

    const pedidos: Pedido[] = [];

    for (const filaP of filasPedidos) {
      const queryLineas = `
        SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.total, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
        FROM producto_pedido pp
        INNER JOIN producto p ON pp.producto_id = p.id
        WHERE pp.pedido_id = ?
        ORDER BY pp.id ASC
      `;

      const [filasLineas] = await pool.execute<RowDataPacket[]>(queryLineas, [filaP.id]);

      const lineas: ProductoPedido[] = filasLineas.map(
        (f) =>
          new ProductoPedido(
            f.producto_id,
            Number(f.cantidad),
            Number(f.precio_unitario),
            f.notas,
            Number(f.total),
            f.id,
            f.pedido_id,
            new Date(f.fecha_creacion),
            f.nombre_producto
          )
      );

      pedidos.push(
        new Pedido(
          filaP.usuario_id,
          Number(filaP.total_productos),
          Number(filaP.total_extras),
          filaP.descripcion_extras,
          Boolean(filaP.extras),
          Number(filaP.total),
          filaP.tipo_pago,
          filaP.notas,
          filaP.id,
          new Date(filaP.fecha_creacion),
          new Date(filaP.fecha_actualizacion),
          lineas,
          undefined,
          filaP.usuario_nombre
        )
      );
    }

    return pedidos;
  }

  async listar(filtros: FiltrosPedido = {}): Promise<Pedido[]> {
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 50;
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.soloExtras === true) {
      condiciones.push('p.extras = 1');
    }

    if (filtros.fechaInicio) {
      condiciones.push('p.fecha_creacion >= ?');
      params.push(`${filtros.fechaInicio} 00:00:00`);
    }

    if (filtros.fechaFin) {
      condiciones.push('p.fecha_creacion <= ?');
      params.push(`${filtros.fechaFin} 23:59:59`);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const limitClause = filtros.sinLimite ? '' : 'LIMIT ?';

    const query = `
      SELECT 
        p.id, 
        p.usuario_id, 
        u.nombre AS usuario_nombre,
        p.total_productos, 
        p.total_extras, 
        p.descripcion_extras, 
        p.extras, 
        p.total, 
        p.tipo_pago, 
        p.notas, 
        p.fecha_creacion, 
        p.fecha_actualizacion
      FROM pedido p
      INNER JOIN usuario u ON p.usuario_id = u.id
      ${whereClause}
      ORDER BY p.fecha_creacion DESC
      ${limitClause}
    `;

    if (!filtros.sinLimite) {
      params.push(String(limite));
    }

    const [filas] = await pool.execute<RowDataPacket[]>(query, params);

    return filas.map(
      (f) =>
        new Pedido(
          f.usuario_id,
          Number(f.total_productos),
          Number(f.total_extras),
          f.descripcion_extras,
          Boolean(f.extras),
          Number(f.total),
          f.tipo_pago,
          f.notas,
          f.id,
          new Date(f.fecha_creacion),
          new Date(f.fecha_actualizacion),
          undefined,
          undefined,
          f.usuario_nombre
        )
    );
  }
}
