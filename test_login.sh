#!/bin/bash

echo "Probando login con usuario 1..."

# Intentar iniciar sesión con el primer usuario (corregido)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rddev2278@gmail.com","password":"123456"}'

echo -e "\n"

# Intentar segundo usuario
echo "Probando login con usuario 2..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"xtest@gmail.com","password":"123456"}'

echo -e "\n"

# Intentar tercer usuario
echo "Probando login con usuario 3..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"binefod446@deusa7.com","password":"123456"}'

echo -e "\n"