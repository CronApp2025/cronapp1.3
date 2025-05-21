from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

# Configurar el directorio desde donde serviremos los archivos
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Crear el servidor HTTP
server_address = ('', 5000)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
print(f"Servidor iniciado en http://0.0.0.0:5000")
httpd.serve_forever()