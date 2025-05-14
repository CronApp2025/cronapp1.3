import os
from dotenv import load_dotenv

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

EXPIRE_TOKEN_TIME = {
    "ACCESS_TOKEN_MINUTES": 60,
    "REFRESH_TOKEN_DAYS": 30
}

# Token blacklist settings
TOKEN_BLACKLIST_ENABLED = True

# Clave secreta para JWT y operaciones de seguridad
import secrets

# Asegurar que SECRET_KEY siempre tenga un valor válido
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    os.environ['SECRET_KEY'] = SECRET_KEY  # Guardar en variables de entorno

JWT_SECRET_KEY = SECRET_KEY

# Configuración para password reset
SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'password-reset-salt')