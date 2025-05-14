import { exec } from 'child_process';

console.log('[express] Iniciando exclusivamente la API Flask...');
console.log('[express] La API Flask debería estar corriendo en http://localhost:5000');
console.log('[express] El servidor Express ha sido desactivado, solo se usa la API Flask.');

// Inicia el servidor Flask
const flaskProcess = exec('./start-flask-api.sh', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al iniciar el servidor Flask: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error en Flask: ${stderr}`);
    return;
  }
  
  console.log(`Flask está ejecutándose: ${stdout}`);
});

// Maneja la salida continua
flaskProcess.stdout?.on('data', (data) => {
  console.log(`${data}`);
});

flaskProcess.stderr?.on('data', (data) => {
  console.error(`${data}`);
});

// Maneja el cierre del proceso
process.on('SIGINT', () => {
  console.log('Deteniendo el servidor Flask...');
  flaskProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Deteniendo el servidor Flask...');
  flaskProcess.kill();
  process.exit(0);
});