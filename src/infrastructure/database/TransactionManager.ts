import { PoolConnection } from 'mysql2/promise';
import { pool } from '../../config/database.js';

export class TransactionManager {
  /**
   * Ejecuta una serie de operaciones dentro de una transacción atómica de MySQL.
   * Si la función callback se ejecuta con éxito, se realiza COMMIT.
   * Si ocurre cualquier error, se realiza ROLLBACK y se propaga la excepción.
   * En cualquier escenario, la conexión se libera al pool.
   */
  static async ejecutar<T>(operacion: (conexion: PoolConnection) => Promise<T>): Promise<T> {
    const conexion: PoolConnection = await pool.getConnection();

    try {
      await conexion.beginTransaction();

      const resultado = await operacion(conexion);

      await conexion.commit();
      return resultado;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }
}

