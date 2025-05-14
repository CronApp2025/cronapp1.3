// Script para crear tablas en MySQL
import mysql from 'mysql2/promise';

async function createTables() {
  let connection;
  try {
    // Crear conexión con las variables de entorno
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306')
    });
    
    console.log('Conexión a MySQL establecida con éxito');
    
    // Desactivar verificación de clave externa temporalmente
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    
    // Tabla de usuarios
    console.log('Creando tabla: users');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        fecha_nacimiento DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabla de condiciones
    console.log('Creando tabla: conditions');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conditions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        icon VARCHAR(255) DEFAULT 'activity',
        diagnosed_date DATE NOT NULL,
        last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Tabla de métricas
    console.log('Creando tabla: metrics');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        condition_id INT NOT NULL,
        \`key\` VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        unit VARCHAR(50),
        risk_level VARCHAR(50),
        date_recorded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (condition_id) REFERENCES conditions(id)
      )
    `);
    
    // Tabla de alertas
    console.log('Creando tabla: alerts');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        alert_type VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        risk_level INT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Tabla de recursos educativos
    console.log('Creando tabla: educational_resources');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS educational_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        url VARCHAR(255),
        is_new BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabla de tokens de restablecimiento de contraseña
    console.log('Creando tabla: password_reset_tokens');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Reactivar verificación de clave externa
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    
    console.log('Todas las tablas creadas con éxito');
    
    return true;
  } catch (error) {
    console.error('Error al crear tablas en MySQL:', error.message);
    return false;
  } finally {
    if (connection) {
      // Cerrar la conexión
      await connection.end();
      console.log('Conexión cerrada correctamente');
    }
  }
}

// Ejecutar la creación de tablas
createTables().then(success => {
  console.log('Creación de tablas finalizada con éxito:', success);
}).catch(err => {
  console.error('Error en la creación de tablas:', err);
});