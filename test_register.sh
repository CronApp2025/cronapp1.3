#!/bin/bash

# Generar timestamp único para evitar duplicación de email
TIMESTAMP=$(date +%s)
EMAIL="usuario.prueba.${TIMESTAMP}@example.com"

echo "Probando registro de nuevo usuario con email: ${EMAIL}"

# Crear un nuevo usuario
curl -X POST http://localhost:5000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Usuario",
    "apellido": "Prueba",
    "email": "'${EMAIL}'",
    "password": "A1@abcdefghijk",
    "fecha_nacimiento": "1990-01-01"
  }'

echo -e "\n"