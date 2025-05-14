// server/index.ts
import { exec } from "child_process";
console.log("[express] Iniciando exclusivamente la API Flask...");
console.log("[express] La API Flask deber\xEDa estar corriendo en http://localhost:5000");
console.log("[express] El servidor Express ha sido desactivado, solo se usa la API Flask.");
var flaskProcess = exec("./start-flask-api.sh", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al iniciar el servidor Flask: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error en Flask: ${stderr}`);
    return;
  }
  console.log(`Flask est\xE1 ejecut\xE1ndose: ${stdout}`);
});
flaskProcess.stdout?.on("data", (data) => {
  console.log(`${data}`);
});
flaskProcess.stderr?.on("data", (data) => {
  console.error(`${data}`);
});
process.on("SIGINT", () => {
  console.log("Deteniendo el servidor Flask...");
  flaskProcess.kill();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("Deteniendo el servidor Flask...");
  flaskProcess.kill();
  process.exit(0);
});
