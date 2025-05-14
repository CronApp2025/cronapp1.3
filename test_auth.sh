#!/bin/bash

# Variables de configuración
API_URL="http://localhost:5000"
EMAIL="test@example.com"
PASSWORD="Passw0rd!"

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Test de Autenticación con Sesiones Persistentes${NC}"
echo "==============================================="

# Paso 1: Prueba de login
echo -e "\n${YELLOW}1. Intentando iniciar sesión...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookie.txt -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Comprobar si hay error en el login
if echo "$LOGIN_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Error en login:${NC} $LOGIN_RESPONSE"
  echo "¿El usuario existe? Puedes necesitar crearlo primero."
  exit 1
else
  echo -e "${GREEN}Login exitoso${NC}"
  echo "Respuesta: $LOGIN_RESPONSE"
  
  # Extraer session_id de la respuesta
  SESSION_ID=$(echo $LOGIN_RESPONSE | grep -o '"session_id":"[^"]*"' | sed 's/"session_id":"//g' | sed 's/"//g')
  echo "Session ID: $SESSION_ID"
  
  # Ver cookies almacenadas
  echo -e "\n${YELLOW}Cookies establecidas:${NC}"
  cat cookie.txt
fi

# Paso 2: Validar token
echo -e "\n${YELLOW}2. Validando token...${NC}"
VALIDATE_RESPONSE=$(curl -s -b cookie.txt -X GET $API_URL/api/auth/validate)

# Comprobar si hay error en la validación
if echo "$VALIDATE_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Error en validación:${NC} $VALIDATE_RESPONSE"
else
  echo -e "${GREEN}Validación exitosa${NC}"
  echo "Respuesta: $VALIDATE_RESPONSE"
fi

# Paso 3: Probar refresh token
echo -e "\n${YELLOW}3. Refrescando token...${NC}"

# Extraer el CSRF token de la cookie
CSRF_TOKEN=$(grep csrf_refresh_token cookie.txt | awk '{print $7}')
echo "Usando CSRF token: $CSRF_TOKEN"

# Ejecutar refresh con el token CSRF
REFRESH_RESPONSE=$(curl -s -b cookie.txt -c cookie.txt -X POST $API_URL/api/auth/refresh \
  -H "X-CSRF-TOKEN: $CSRF_TOKEN")

# Comprobar si hay error en el refresh
if echo "$REFRESH_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Error en refresh:${NC} $REFRESH_RESPONSE"
else
  echo -e "${GREEN}Refresh exitoso${NC}"
  echo "Respuesta: $REFRESH_RESPONSE"
  
  # Ver cookies actualizadas
  echo -e "\n${YELLOW}Cookies actualizadas:${NC}"
  cat cookie.txt
fi

# Paso 4: Validar token refrescado
echo -e "\n${YELLOW}4. Validando token refrescado...${NC}"
VALIDATE_RESPONSE2=$(curl -s -b cookie.txt -X GET $API_URL/api/auth/validate)

# Comprobar si hay error en la validación
if echo "$VALIDATE_RESPONSE2" | grep -q "error"; then
  echo -e "${RED}Error en validación post-refresh:${NC} $VALIDATE_RESPONSE2"
else
  echo -e "${GREEN}Validación post-refresh exitosa${NC}"
  echo "Respuesta: $VALIDATE_RESPONSE2"
fi

# Paso 5: Logout (solo de la sesión actual)
echo -e "\n${YELLOW}5. Cerrando sesión actual...${NC}"
LOGOUT_RESPONSE=$(curl -s -b cookie.txt -c cookie.txt -X POST $API_URL/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SESSION_ID\"}")

# Comprobar si hay error en logout
if echo "$LOGOUT_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Error en logout:${NC} $LOGOUT_RESPONSE"
else
  echo -e "${GREEN}Logout exitoso${NC}"
  echo "Respuesta: $LOGOUT_RESPONSE"
  
  # Ver cookies después de logout
  echo -e "\n${YELLOW}Cookies después de logout:${NC}"
  cat cookie.txt
  
  # Validar de nuevo (debería fallar)
  echo -e "\n${YELLOW}6. Validando después de logout (debería fallar)...${NC}"
  VALIDATE_RESPONSE3=$(curl -s -b cookie.txt -X GET $API_URL/api/auth/validate)
  
  if echo "$VALIDATE_RESPONSE3" | grep -q "error" || echo "$VALIDATE_RESPONSE3" | grep -q "inválido"; then
    echo -e "${GREEN}Prueba exitosa: Token invalidado correctamente${NC}"
  else
    echo -e "${RED}Error: Token sigue siendo válido después de logout${NC}"
    echo "Respuesta: $VALIDATE_RESPONSE3"
  fi
fi

# Limpieza
rm -f cookie.txt

echo -e "\n${GREEN}Test completado${NC}"