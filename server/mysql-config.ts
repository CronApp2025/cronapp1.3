// MySQL Configuration for Drizzle
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'cronapp',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

export default mysqlConfig;