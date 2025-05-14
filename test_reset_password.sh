#!/bin/bash

# Extraer el token de recuperación del resultado del test_forgot_password.sh
TOKEN=$(grep -o '"token": "[^"]*' test_forgot_password.sh.output | cut -d '"' -f 4)

if [ -z "$TOKEN" ]; then
  # Si no podemos extraer el token del archivo, usar el último token conocido
  TOKEN="InVzdWFyaW8ucHJ1ZWJhLjE3NDcxOTg1NjBAZXhhbXBsZS5jb20i.aCQi-w.iU1kYhtwZAfnDIwS38wDqo8Q6wU"
fi

echo "Probando restablecimiento de contraseña con token: $TOKEN"

# Solicitar cambio de contraseña con el token
curl -X POST http://localhost:5000/api/recover/resetear_password/$TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "B2@lmnopqrstuv",
    "confirm_password": "B2@lmnopqrstuv"
  }'

echo -e "\n"