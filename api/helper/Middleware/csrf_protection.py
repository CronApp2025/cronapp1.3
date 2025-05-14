"""
CSRF Protection Middleware

Este módulo proporciona protección contra ataques de falsificación de solicitudes entre sitios (CSRF).
"""

import secrets
from functools import wraps
from flask import request, session, abort

def generate_csrf_token():
    """
    Genera un token CSRF aleatorio y seguro
    """
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']

def csrf_protect(exempted_routes=None):
    """
    Decorador para proteger rutas contra ataques CSRF.
    
    Args:
        exempted_routes: Lista de rutas que están exentas de protección CSRF
    """
    exempted_routes = exempted_routes or []
    
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Si la ruta está exenta, no realizar verificación
            if request.path in exempted_routes:
                return f(*args, **kwargs)
                
            # Para métodos que modifican estado (no GET, HEAD, OPTIONS)
            if request.method not in ['GET', 'HEAD', 'OPTIONS']:
                token = session.get('csrf_token')
                
                # Verificar token desde encabezado o datos del formulario
                request_token = request.headers.get('X-CSRF-TOKEN')
                if not request_token:
                    request_token = request.form.get('csrf_token')
                    
                if not request_token:
                    request_json = request.get_json(silent=True)
                    if request_json and isinstance(request_json, dict):
                        request_token = request_json.get('csrf_token')
                
                if not token or not request_token or token != request_token:
                    abort(403, description="CSRF token inválido o faltante")
                    
            return f(*args, **kwargs)
        return wrapped
    return decorator

def setup_csrf_protection(app):
    """
    Configura la protección CSRF para la aplicación Flask.
    
    Args:
        app: Instancia de la aplicación Flask
    """
    # Asegurar que la clave secreta esté configurada para session
    if not app.secret_key:
        app.logger.warning("Flask secret_key no configurada. Usando una clave generada aleatoriamente.")
        app.secret_key = secrets.token_hex(32)
    
    # Agregar función template global para generar tokens CSRF
    app.jinja_env.globals['csrf_token'] = generate_csrf_token
    
    # Configurar protección CSRF para todas las rutas modificadoras de estado
    @app.before_request
    def csrf_protect_all():
        # Excluir métodos GET, HEAD, OPTIONS y ciertas rutas (como login, Google auth)
        if request.method not in ['GET', 'HEAD', 'OPTIONS'] and \
           request.path not in ['/api/auth/login', '/api/auth/google', '/api/register/']:
            token = session.get('csrf_token')
            
            # Verificar token desde encabezado o datos del formulario
            request_token = request.headers.get('X-CSRF-TOKEN')
            if not request_token:
                request_token = request.form.get('csrf_token')
                
            if not request_token:
                request_json = request.get_json(silent=True)
                if request_json and isinstance(request_json, dict):
                    request_token = request_json.get('csrf_token')
            
            if not token or not request_token or token != request_token:
                # No fallar en desarrollo para facilitar pruebas
                if app.config.get('ENV') == 'production':
                    abort(403, description="CSRF token inválido o faltante")
                else:
                    app.logger.warning("CSRF token inválido o faltante - permitido en desarrollo")