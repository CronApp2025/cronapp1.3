#!/bin/bash

# Usar el email del último usuario registrado exitosamente
LAST_EMAIL="usuario.prueba.1747198560@example.com"

echo "Probando solicitud de restablecimiento de contraseña para: $LAST_EMAIL..."

# Solicitar restablecimiento para el usuario que acabamos de crear
curl -X POST http://localhost:5000/api/recover/solicitar_recuperacion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$LAST_EMAIL'"
  }'

echo -e "\n"