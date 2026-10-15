import { pool } from './config/database.js';

async function probarConexion() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Conexión exitosa a MySQL (heladeria_ciocolatto)!');
    console.log('Tablas detectadas:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
    process.exit(1);
  }
}

probarConexion();
