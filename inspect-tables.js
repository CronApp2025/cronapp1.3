// Script para explorar tablas existentes en MySQL
import mysql from 'mysql2/promise';

async function inspectTables() {
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
    
    // Obtener la lista de tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas existentes en la base de datos:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Para cada tabla, obtenemos la estructura
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\nEstructura de la tabla: ${tableName}`);
      
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al inspeccionar tablas en MySQL:', error.message);
    return false;
  } finally {
    if (connection) {
      // Cerrar la conexión
      await connection.end();
      console.log('\nConexión cerrada correctamente');
    }
  }
}

// Ejecutar la inspección de tablas
inspectTables().then(success => {
  console.log('Inspección de tablas finalizada con éxito:', success);
}).catch(err => {
  console.error('Error en la inspección de tablas:', err);
});