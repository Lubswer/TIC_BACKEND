import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository.js';
import { Pedido } from '../../../domain/entities/Pedido.js';
import { ProductoPedido } from '../../../domain/entities/ProductoPedido.js';
import { TransactionManager } from '../TransactionManager.js';

export class PedidoMySqlRepository implements IPedidoRepository {

  async crearConLineas(pedido: Pedido, lineas: ProductoPedido[]): Promise<Pedido> {
    return await TransactionManager.ejecutar(async (conexion) => {
      // 1. Insertar la cabecera del pedido
      const queryPedido = `
        INSERT INTO pedido (
          usuario_id,
          total_productos,
          total_extras,
          descripcion_extras,
          total,
          tipo_pago,
          notas
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [resultadoPedido] = await conexion.execute<ResultSetHeader>(queryPedido, [
        pedido.usuario_id,
        pedido.total_productos,
        pedido.total_extras,
        pedido.descripcion_extras ?? null,
        pedido.total,
        pedido.tipo_pago,
        pedido.notas ?? null,
      ]);

      const pedidoId = resultadoPedido.insertId;

      // 2. Insertar cada línea en producto_pedido y descontar stock si aplica
      const queryLinea = `
        INSERT INTO producto_pedido (
          pedido_id,
          producto_id,
          cantidad,
          precio_unitario,
          notas
        )
        VALUES (?, ?, ?, ?, ?)
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
        // Insertar renglón del pedido
        await conexion.execute<ResultSetHeader>(queryLinea, [
          pedidoId,
          linea.producto_id,
          linea.cantidad,
          linea.precio_unitario,
          linea.notas ?? null,
        ]);

        // Descontar stock atómicamente si el producto maneja stock
        await conexion.execute<ResultSetHeader>(queryDescontarStock, [
          linea.cantidad,
          linea.cantidad,
          linea.producto_id,
        ]);
      }

      // 3. Crear automáticamente el ticket para la cocina en estado 'pendiente'
      const queryTicket = `
        INSERT INTO ticket (pedido_id, estado)
        VALUES (?, 'pendiente')
      `;

      await conexion.execute<ResultSetHeader>(queryTicket, [pedidoId]);

      // 4. Retornar el pedido completo reconstruido
      const pedidoCreado = await this.buscarPorIdConConexion(conexion, pedidoId);
      return pedidoCreado!;
    });
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const conexion = pool;

    const queryPedido = `
      SELECT id, usuario_id, total_productos, total_extras, descripcion_extras, total, tipo_pago, notas, fecha_creacion, fecha_actualizacion
      FROM pedido
      WHERE id = ?
      LIMIT 1
    `;

    const [filasPedido] = await conexion.execute<RowDataPacket[]>(queryPedido, [id]);

    if (filasPedido.length === 0) {
      return null;
    }

    const filaP = filasPedido[0];

    // Buscar las líneas con el nombre legible del producto (JOIN)
    const queryLineas = `
      SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
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
      Number(filaP.total),
      filaP.tipo_pago,
      filaP.notas,
      filaP.id,
      new Date(filaP.fecha_creacion),
      new Date(filaP.fecha_actualizacion),
      lineas
    );
  }

  /**
   * Método privado auxiliar que lee el pedido recién creado usando la misma conexión activa
   * antes de que se confirme el COMMIT.
   */
  private async buscarPorIdConConexion(conexion: any, id: number): Promise<Pedido | null> {
    const queryPedido = `
      SELECT id, usuario_id, total_productos, total_extras, descripcion_extras, total, tipo_pago, notas, fecha_creacion, fecha_actualizacion
      FROM pedido
      WHERE id = ?
      LIMIT 1
    `;

    const [filasPedido] = await conexion.execute(queryPedido, [id]);

    if (filasPedido.length === 0) {
      return null;
    }

    const filaP = filasPedido[0];

    const queryLineas = `
      SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
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
      Number(filaP.total),
      filaP.tipo_pago,
      filaP.notas,
      filaP.id,
      new Date(filaP.fecha_creacion),
      new Date(filaP.fecha_actualizacion),
      lineas
    );
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Pedido[]> {
    const queryPedidos = `
      SELECT id, usuario_id, total_productos, total_extras, descripcion_extras, total, tipo_pago, notas, fecha_creacion, fecha_actualizacion
      FROM pedido
      WHERE usuario_id = ?
      ORDER BY fecha_creacion DESC
    `;

    const [filasPedidos] = await pool.execute<RowDataPacket[]>(queryPedidos, [usuarioId]);

    if (filasPedidos.length === 0) {
      return [];
    }

    const pedidos: Pedido[] = [];

    for (const filaP of filasPedidos) {
      const queryLineas = `
        SELECT pp.id, pp.pedido_id, pp.producto_id, pp.cantidad, pp.precio_unitario, pp.notas, pp.fecha_creacion, p.nombre AS nombre_producto
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
          Number(filaP.total),
          filaP.tipo_pago,
          filaP.notas,
          filaP.id,
          new Date(filaP.fecha_creacion),
          new Date(filaP.fecha_actualizacion),
          lineas
        )
      );
    }

    return pedidos;
  }

  async listar(limite: number = 50): Promise<Pedido[]> {
    const query = `
      SELECT id, usuario_id, total_productos, total_extras, descripcion_extras, total, tipo_pago, notas, fecha_creacion, fecha_actualizacion
      FROM pedido
      ORDER BY fecha_creacion DESC
      LIMIT ?
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [String(limite)]);

    return filas.map(
      (f) =>
        new Pedido(
          f.usuario_id,
          Number(f.total_productos),
          Number(f.total_extras),
          f.descripcion_extras,
          Number(f.total),
          f.tipo_pago,
          f.notas,
          f.id,
          new Date(f.fecha_creacion),
          new Date(f.fecha_actualizacion)
        )
    );
  }
}

