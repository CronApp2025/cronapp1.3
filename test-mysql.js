// Script de prueba para conexión a MySQL
import mysql from 'mysql2/promise';

async function testMySQLConnection() {
  try {
    // Crear conexión con las variables de entorno
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306')
    });
    
    console.log('Conexión a MySQL establecida con éxito');
    
    // Intentar ejecutar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Resultado de la consulta:', rows);
    
    // Cerrar la conexión
    await connection.end();
    console.log('Conexión cerrada correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    return false;
  }
}

// Ejecutar la prueba
testMySQLConnection().then(success => {
  console.log('Prueba finalizada con éxito:', success);
}).catch(err => {
  console.error('Error en la prueba:', err);
});