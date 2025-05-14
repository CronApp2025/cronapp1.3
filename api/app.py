from flask import Flask, send_from_directory, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from datetime import timedelta
import os
import logging
from config import EXPIRE_TOKEN_TIME, JWT_COOKIE_SECURE, JWT_COOKIE_SAMESITE, JWT_COOKIE_CSRF_PROTECT, JWT_TOKEN_LOCATION
from routes.auth import auth
from routes.usuario import usuarios
from routes.recover_password import recover_password
from routes.register import register
from routes.settings import settings
from functools import wraps
# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
# Configuración más específica de CORS para permitir solicitudes desde cualquier origen
cors_config = {
    "origins": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
}
CORS(app, resources={r"/*": cors_config})

# Importar y configurar nuestro propio rate limiter
from helper.Middleware.rate_limiter import setup_global_rate_limit
from helper.Middleware.csrf_protection import setup_csrf_protection

# Configurar el rate limiter
setup_global_rate_limit(app)

# FIX: Configurar protección CSRF
setup_csrf_protection(app)

# Middleware para cabeceras de seguridad
@app.after_request
def add_security_headers(response):
    """
    Añade cabeceras de seguridad a todas las respuestas
    - Strict-Transport-Security: Forzar HTTPS
    - Content-Security-Policy: Bloquear scripts externos
    - X-Content-Type-Options: Prevenir sniffing de MIME
    - X-Frame-Options: Prevenir clickjacking
    - X-XSS-Protection: Protección contra XSS
    """
    # Forzar HTTPS
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # Política de seguridad de contenido estricta
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
    
    # Prevenir sniffing de tipos MIME
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevenir clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # Protección XSS
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Permitir en desarrollo CORS por ahora
    if app.debug:
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    
    return response

# Configuración de claves secretas - Usar claves robustas y aleatorias
# FIX: Usar valores secretos robustos y aleatorios en lugar de claves predecibles
import secrets
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.environ.get('SESSION_SECRET', secrets.token_hex(32))
app.config['SECURITY_PASSWORD_SALT'] = os.environ.get('SECURITY_PASSWORD_SALT', secrets.token_hex(16))

# Configuración de JWT con mejor seguridad
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])

# FIX: Usar sólo cookies con máxima seguridad (no headers para evitar XSS)
app.config['JWT_TOKEN_LOCATION'] = JWT_TOKEN_LOCATION  # Sólo cookies, no headers
app.config['JWT_COOKIE_SECURE'] = JWT_COOKIE_SECURE  # Cookies solo en HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = JWT_COOKIE_CSRF_PROTECT  # Protección CSRF para cookies
app.config['JWT_COOKIE_SAMESITE'] = JWT_COOKIE_SAMESITE  # SameSite=Strict para prevenir CSRF
app.config['JWT_COOKIE_DOMAIN'] = None  # Solo dominio actual
app.config['JWT_ACCESS_COOKIE_PATH'] = "/"
app.config['JWT_REFRESH_COOKIE_PATH'] = "/api/auth/refresh"
app.config['JWT_CSRF_IN_COOKIES'] = True  # Almacenar tokens CSRF en cookies
app.config['JWT_COOKIE_DOMAIN'] = None  # No permitir dominios cruzados

# Incluir mínima información en el token
app.config['JWT_IDENTITY_CLAIM'] = 'user_id'

jwt = JWTManager(app)

# Callback para verificar tokens contra la denylist
from helper.token_manager import token_manager

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    """
    Verifica si un token ha sido revocado (está en la denylist)
    """
    # Obtener session_id del payload
    session_id = jwt_payload.get("session_id")
    
    # Verificar si el session_id está en la denylist
    return token_manager.is_denied(session_id)

@jwt.user_identity_loader
def user_identity_lookup(identity):
    """
    Convierte siempre la identidad a string para consistencia
    """
    return str(identity)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_payload):
    """
    Busca al usuario basado en el payload del token
    """
    # Obtener user_id del token
    user_id = jwt_payload.get("sub")
    session_id = jwt_payload.get("session_id")
    
    print(f"Validando usuario: {user_id} con sesión: {session_id}")
    
    # Si no hay session_id, algo está mal
    if not session_id:
        print(f"Error: Token sin session_id para usuario {user_id}")
        return None
    
    try:
        # Verificar sesión aquí
        if not token_manager.validate_session(str(user_id), str(session_id)):
            # Si la sesión no es válida, devolver None para causar error de autenticación
            print(f"Error: Sesión {session_id} inválida para usuario {user_id}")
            return None
        
        print(f"Sesión {session_id} validada para usuario {user_id}")
        
        # Aquí podrías buscar al usuario en la base de datos
        # En este caso solo devolvemos el ID ya que no necesitamos más para verificar
        return {"id": user_id, "session_id": session_id}
    except Exception as e:
        print(f"Error al validar usuario: {str(e)}")
        return None

# Configuración de Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')

mail = Mail(app)

# Configurar directorio de archivos estáticos
client_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist', 'public')
client_public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'public')

# Verificar si existen los directorios y establecer el directorio estático
if os.path.exists(client_public_dir):
    app.logger.info(f"Usando directorio client/public como fuente de archivos estáticos: {client_public_dir}")
    app.static_folder = client_public_dir
else:
    if not os.path.exists(client_dir):
        app.logger.warning(f"El directorio dist/public no existe: {client_dir}")
        os.makedirs(client_dir, exist_ok=True)
        app.logger.info(f"Se creó el directorio dist/public: {client_dir}")
    
    app.logger.info(f"Usando directorio dist/public como fuente de archivos estáticos: {client_dir}")
    app.static_folder = client_dir

# Exponer las rutas a nivel global
app.config['CLIENT_PUBLIC_DIR'] = client_public_dir
app.config['CLIENT_DIR'] = client_dir

# Registrar blueprints
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(usuarios, url_prefix='/api/usuarios')
app.register_blueprint(recover_password, url_prefix='/api/recover')
app.register_blueprint(register, url_prefix='/api/register')
app.register_blueprint(settings, url_prefix='/api')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Definir directorios para acceso local en esta función
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'public')
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist', 'public')
    
    if path.startswith('api/'):
        return {"message": "API endpoint not found"}, 404
    
    # Manejo especial para las rutas de reseteo de contraseña
    if path.startswith('reset-password/'):
        # Servir nuestra página HTML independiente para reseteo de contraseña
        try:
            app.logger.info(f"Sirviendo página de reseteo de contraseña para token: {path.split('/')[-1]}")
            
            # Directorio público del cliente
            if os.path.exists(os.path.join(public_dir, 'reset-password.html')):
                return send_from_directory(public_dir, 'reset-password.html')
            
            # Directorio del cliente compilado
            if os.path.exists(os.path.join(dist_dir, 'reset-password.html')):
                return send_from_directory(dist_dir, 'reset-password.html')
                
            # Si no encuentra la página específica, usar el index.html
            if os.path.exists(os.path.join(public_dir, 'index.html')):
                return send_from_directory(public_dir, 'index.html')
            
            return send_from_directory(dist_dir, 'index.html')
        except Exception as e:
            app.logger.error(f"Error al servir página de reseteo: {str(e)}")
            return {"message": "Error serving reset password page"}, 500
    
    try:
        # Primero buscar en el directorio client/public
        if path and os.path.exists(os.path.join(public_dir, path)):
            app.logger.debug(f"Sirviendo archivo estático desde client/public: {path}")
            return send_from_directory(public_dir, path)
        
        # Luego buscar en el directorio dist/public
        if path and os.path.exists(os.path.join(dist_dir, path)):
            app.logger.debug(f"Sirviendo archivo estático desde dist/public: {path}")
            return send_from_directory(dist_dir, path)
        
        # Si no se encuentra el archivo pero existe index.html en client/public, servirlo
        if os.path.exists(os.path.join(public_dir, 'index.html')):
            app.logger.debug(f"Sirviendo index.html desde client/public como fallback")
            return send_from_directory(public_dir, 'index.html')
        
        # Como último recurso, servir index.html desde dist/public
        app.logger.debug(f"Sirviendo index.html desde dist/public como fallback")
        return send_from_directory(dist_dir, 'index.html')
    except Exception as e:
        app.logger.error(f"Error sirviendo archivo: {str(e)}")
        return {"message": "File not found"}, 404

@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        "status": "success",
        "message": "API Flask funcionando correctamente"
    })

if __name__ == '__main__':
    print(f"Iniciando servidor Flask en http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)