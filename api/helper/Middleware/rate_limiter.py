"""
Rate Limiter Middleware

Este módulo proporciona un middleware para limitar la tasa de solicitudes 
a endpoints específicos, ayudando a prevenir ataques de fuerza bruta y
abuso de la API.
"""

import time
from collections import defaultdict
import threading
from functools import wraps
from flask import request, jsonify
from helper.response_utils import error_response

# Store para IP addresses y timestamps (en memoria)
ip_store = defaultdict(list)
ip_store_lock = threading.Lock()

# Store para rutas específicas
route_store = defaultdict(lambda: defaultdict(list))
route_store_lock = threading.Lock()

# Función para limpiar entradas antiguas (ejecutar periódicamente)
def cleanup_old_entries():
    """Limpia entradas antiguas del store de IPs para evitar crecimiento infinito."""
    while True:
        time.sleep(60)  # Limpiar cada minuto
        current_time = time.time()
        
        # Limpiar store de IPs
        with ip_store_lock:
            for ip in list(ip_store.keys()):
                # Mantener solo las solicitudes de los últimos 10 minutos
                ip_store[ip] = [ts for ts in ip_store[ip] if current_time - ts < 600]
                if not ip_store[ip]:
                    del ip_store[ip]
        
        # Limpiar store de rutas
        with route_store_lock:
            for route in list(route_store.keys()):
                for ip in list(route_store[route].keys()):
                    # Mantener solo las solicitudes de los últimos 10 minutos
                    route_store[route][ip] = [ts for ts in route_store[route][ip] if current_time - ts < 600]
                    if not route_store[route][ip]:
                        del route_store[route][ip]
                if not route_store[route]:
                    del route_store[route]

# Iniciar thread de limpieza
cleanup_thread = threading.Thread(target=cleanup_old_entries, daemon=True)
cleanup_thread.start()

def rate_limit(max_requests=100, per_seconds=60, by_route=False):
    """
    Decorador para limitar la tasa de solicitudes.
    
    Args:
        max_requests: Número máximo de solicitudes permitidas en el período
        per_seconds: Período de tiempo en segundos
        by_route: Si es True, el límite se aplica por ruta específica
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr or 'unknown'
            current_time = time.time()
            route = request.path if by_route else 'global'
            
            if by_route:
                with route_store_lock:
                    route_store[route][ip].append(current_time)
                    # Eliminar requests antiguas fuera del período de tiempo
                    route_store[route][ip] = [
                        ts for ts in route_store[route][ip] 
                        if current_time - ts < per_seconds
                    ]
                    request_count = len(route_store[route][ip])
            else:
                with ip_store_lock:
                    ip_store[ip].append(current_time)
                    # Eliminar requests antiguas fuera del período de tiempo
                    ip_store[ip] = [
                        ts for ts in ip_store[ip] 
                        if current_time - ts < per_seconds
                    ]
                    request_count = len(ip_store[ip])
            
            if request_count > max_requests:
                return error_response(
                    msg=f"Demasiadas solicitudes. Por favor, inténtelo de nuevo después de {per_seconds} segundos.",
                    status_code=429
                )
                
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Middleware para aplicar globalmente usando before_request
def setup_global_rate_limit(app):
    """Configura un límite de tasa global para la aplicación Flask."""
    @app.before_request
    def global_rate_limit():
        if request.path.startswith('/api/') and request.method != 'OPTIONS':
            ip = request.remote_addr or 'unknown'
            current_time = time.time()
            
            with ip_store_lock:
                ip_store[ip].append(current_time)
                # Mantener solo solicitudes de los últimos 60 segundos
                ip_store[ip] = [ts for ts in ip_store[ip] if current_time - ts < 60]
                
                # Límite global de 100 solicitudes por minuto
                if len(ip_store[ip]) > 100:
                    return error_response(
                        msg="Límite de tasa excedido. Por favor, inténtelo de nuevo más tarde.",
                        status_code=429
                    ), 429
        
        return None  # Continuar con la solicitud