import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { IProductoRepository, FiltrosProducto } from '../../../domain/repositories/IProductoRepository.js';
import { Producto } from '../../../domain/entities/Producto.js';

export class ProductoMySqlRepository implements IProductoRepository {
  
  private mapearFilaAProducto(fila: RowDataPacket): Producto {
    return new Producto(
      fila.nombre,
      Number(fila.precio),
      fila.descripcion,
      fila.imagen_url,
      fila.stock !== null ? Number(fila.stock) : null,
      Boolean(fila.disponible),
      Boolean(fila.producto_temporada),
      Boolean(fila.activo),
      fila.id,
      new Date(fila.fecha_creacion),
      new Date(fila.fecha_actualizacion)
    );
  }

  async crear(producto: Producto): Promise<Producto> {
    const query = `
      INSERT INTO producto (
        nombre, 
        descripcion, 
        imagen_url, 
        precio, 
        stock, 
        disponible, 
        producto_temporada,
        activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      producto.nombre,
      producto.descripcion ?? null,
      producto.imagen_url ?? null,
      producto.precio,
      producto.stock ?? null,
      producto.disponible ? 1 : 0,
      producto.producto_temporada ? 1 : 0,
      producto.activo ? 1 : 0,
    ]);

    const productoCreado = await this.buscarPorId(resultado.insertId);
    return productoCreado!;
  }

  async buscarPorId(id: number): Promise<Producto | null> {
    const query = `
      SELECT id, nombre, descripcion, imagen_url, precio, stock, disponible, producto_temporada, activo, fecha_creacion, fecha_actualizacion
      FROM producto
      WHERE id = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaAProducto(filas[0]);
  }

  async buscarPorNombre(nombre: string): Promise<Producto | null> {
    const query = `
      SELECT id, nombre, descripcion, imagen_url, precio, stock, disponible, producto_temporada, activo, fecha_creacion, fecha_actualizacion
      FROM producto
      WHERE nombre = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [nombre]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaAProducto(filas[0]);
  }


  async listar(filtros?: FiltrosProducto): Promise<Producto[]> {
    let query = `
      SELECT id, nombre, descripcion, imagen_url, precio, stock, disponible, producto_temporada, activo, fecha_creacion, fecha_actualizacion
      FROM producto
      WHERE 1=1
    `;

    if (filtros?.soloInactivos) {
      query += ` AND activo = 0 `;
    } else if (!filtros?.incluirInactivos) {
      query += ` AND activo = 1 `;
    }

    if (filtros?.soloDisponibles) {
      query += ` AND disponible = 1 `;
    }

    query += ` ORDER BY nombre ASC `;

    const [filas] = await pool.execute<RowDataPacket[]>(query);
    return filas.map((fila) => this.mapearFilaAProducto(fila));
  }

  async actualizar(producto: Producto): Promise<Producto> {
    if (!producto.id) {
      throw new Error('No se puede actualizar un producto que no tiene ID.');
    }

    const query = `
      UPDATE producto
      SET 
        nombre = ?,
        descripcion = ?,
        imagen_url = ?,
        precio = ?,
        stock = ?,
        disponible = ?,
        producto_temporada = ?,
        activo = ?
      WHERE id = ?
    `;

    await pool.execute<ResultSetHeader>(query, [
      producto.nombre,
      producto.descripcion ?? null,
      producto.imagen_url ?? null,
      producto.precio,
      producto.stock ?? null,
      producto.disponible ? 1 : 0,
      producto.producto_temporada ? 1 : 0,
      producto.activo ? 1 : 0,
      producto.id,
    ]);

    const productoActualizado = await this.buscarPorId(producto.id);
    return productoActualizado!;
  }

  async eliminar(id: number): Promise<boolean> {
    const query = `
      UPDATE producto 
      SET activo = 0 
      WHERE id = ?
    `;
    const [resultado] = await pool.execute<ResultSetHeader>(query, [id]);
    return resultado.affectedRows > 0;
  }

  async cambiarDisponibilidad(id: number, disponible: boolean): Promise<boolean> {
    const query = `
      UPDATE producto
      SET disponible = ?
      WHERE id = ?
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      disponible ? 1 : 0,
      id,
    ]);

    return resultado.affectedRows > 0;
  }

  async actualizarStock(id: number, nuevoStock: number | null): Promise<boolean> {
    const query = `
      UPDATE producto
      SET stock = ?
      WHERE id = ?
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      nuevoStock,
      id,
    ]);

    return resultado.affectedRows > 0;
  }
}
