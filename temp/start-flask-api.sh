#!/bin/bash
# Iniciar la API Flask con el frontend
echo "Starting Flask API server..."

# Verificar si estamos en modo desarrollo
if [ "$NODE_ENV" == "production" ]; then
  # En producción, solo iniciamos Flask
  python api/app.py
else
  # En desarrollo, comprobamos si se requiere una reconstrucción del frontend
  if [ "$1" == "rebuild" ]; then
    echo "Rebuilding frontend..."
    cd client && npm run build && cd ..
  fi
  
  # En desarrollo, ejecutar el servidor integrado Flask + Vite
  # python api/dev_server.py
  
  # Por ahora, seguimos usando la versión compilada con Flask
  # pero podemos cambiar a dev_server.py cuando sea necesario
  python api/app.py
fi