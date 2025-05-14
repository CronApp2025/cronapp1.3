import os
from dotenv import load_dotenv
import secrets

# Cargar variables de entorno
load_dotenv()

# Usar la base de datos MySQL
DB_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', ''),
    'database': os.environ.get('MYSQL_DATABASE', 'cronapp'),
    'port': int(os.environ.get('MYSQL_PORT', '3306'))
}

# URL de conexión de base de datos
DATABASE_URL = os.environ.get('DATABASE_URL', '')

# Reducir tiempo de expiración a 15 minutos para mejorar seguridad
EXPIRE_TOKEN_TIME = {
    "ACCESS_TOKEN_MINUTES": 15,  # Reducido de 60 a 15 minutos
    "REFRESH_TOKEN_DAYS": 7      # Reducido de 30 a 7 días
}

# Token denylist settings - Siempre habilitado
TOKEN_BLACKLIST_ENABLED = True

# Clave secreta para JWT y operaciones de seguridad - Alta entropía
# Asegurar que SECRET_KEY siempre tenga un valor válido
SECRET_KEY = os.environ.get('SESSION_SECRET')  # Usar la variable de entorno existente
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    os.environ['SESSION_SECRET'] = SECRET_KEY  # Guardar en variables de entorno

JWT_SECRET_KEY = SECRET_KEY

# Configuración de cookies - Con seguridad mejorada
JWT_COOKIE_SECURE = True  # Solo HTTPS
JWT_COOKIE_SAMESITE = "Strict"  # Prevenir CSRF
JWT_COOKIE_CSRF_PROTECT = True  # Habilitar protección CSRF para cookies
JWT_COOKIE_DOMAIN = None  # Dominio actual solamente
JWT_ACCESS_COOKIE_PATH = "/"
JWT_REFRESH_COOKIE_PATH = "/api/auth/refresh"

# No almacenar cookies sensibles en localStorage/sessionStorage
JWT_TOKEN_LOCATION = ["cookies"]  # Solo cookies, sin headers

# Configuración para password reset - Salt único y seguro
SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', secrets.token_hex(16))