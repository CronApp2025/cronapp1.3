import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import mysqlConfig from './mysql-config';

// Crear pool de conexiones a MySQL usando la configuración
export const pool = mysql.createPool({
  ...mysqlConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Inicializar Drizzle con el pool de MySQL
export const db = drizzle(pool, { schema, mode: 'default' });
