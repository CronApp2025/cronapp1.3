#!/bin/bash

# Usar el email del último usuario registrado exitosamente
LAST_EMAIL="usuario.prueba.1747198560@example.com"

echo "Probando login con el usuario registrado recientemente ($LAST_EMAIL)..."

# Intentar iniciar sesión con el usuario recién creado
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"'$LAST_EMAIL'",
    "password":"B2@lmnopqrstuv"
  }'

echo -e "\n"