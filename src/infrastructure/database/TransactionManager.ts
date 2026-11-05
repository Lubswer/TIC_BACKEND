import { PoolConnection } from 'mysql2/promise';
import { pool } from '../../config/database.js';

export class TransactionManager {
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
