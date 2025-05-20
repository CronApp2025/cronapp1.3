# Implementación del servicio de autenticación de Google basado en el blueprint proporcionado

import json
import os

import requests
from flask import Blueprint, redirect, request, url_for
from flask_login import login_required, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from werkzeug.security import generate_password_hash

from helper.database import get_db_cursor, fetch_one_dict_from_result
from helper.response_utils import success_response, error_response
from helper.token_manager import TokenManager
from routes.auth import build_token

# Usando get para evitar errores cuando las variables no están definidas
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "not-configured")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", "not-configured")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Configure la URL de redirección usando el dominio de desarrollo de Replit
def get_replit_domain():
    """
    Intentar obtener el dominio de Replit de varias formas
    """
    # Obtenemos el dominio de Replit
    if os.environ.get("REPL_SLUG") and os.environ.get("REPL_OWNER"):
        return f'https://{os.environ.get("REPL_SLUG")}.{os.environ.get("REPL_OWNER")}.repl.co'
    
    # Alternativa: dominio directo si está disponible
    if os.environ.get("REPL_IDENTITY"):
        return f'https://{os.environ.get("REPL_IDENTITY")}.repl.co'
    
    # Último recurso
    import socket
    try:
        host_name = socket.gethostname()
        return f'https://{host_name}.repl.co'
    except:
        # Si todo falla, usar un dominio genérico (será necesario actualizar manualmente)
        return 'https://your-repl-name.repl.co'

REPLIT_DOMAIN = get_replit_domain()
DEV_REDIRECT_URL = f'{REPLIT_DOMAIN}/api/google_auth/callback'

# Verificar si las credenciales de Google están configuradas
GOOGLE_AUTH_CONFIGURED = GOOGLE_CLIENT_ID != "not-configured" and GOOGLE_CLIENT_SECRET != "not-configured"

if not GOOGLE_AUTH_CONFIGURED:
    print(f"""
============ ATENCIÓN: AUTENTICACIÓN CON GOOGLE NO CONFIGURADA ============

Para hacer que la autenticación con Google funcione:
1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un nuevo OAuth 2.0 Client ID
3. Añade {DEV_REDIRECT_URL} a las URLs de redirección autorizadas
4. Configura las variables de entorno:
   - GOOGLE_OAUTH_CLIENT_ID
   - GOOGLE_OAUTH_CLIENT_SECRET

La autenticación con Google está actualmente DESHABILITADA.
=========================================================================
""")
else:
    print(f"Autenticación con Google configurada correctamente.")

# Solo inicializar el cliente si las credenciales están configuradas
client = WebApplicationClient(GOOGLE_CLIENT_ID) if GOOGLE_AUTH_CONFIGURED else None

google_auth = Blueprint("google_auth", __name__, url_prefix="/api/google_auth")

token_manager = TokenManager()

@google_auth.route("/login")
def login():
    # Verificar si la autenticación de Google está configurada
    if not GOOGLE_AUTH_CONFIGURED:
        return error_response("La autenticación con Google no está configurada. Por favor, configure las credenciales de OAuth.", 501)
        
    # Obtener la URL de autorización de Google
    try:
        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        # Construir la solicitud de redirección a Google
        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            # Usar la URL de redirección predefinida para evitar problemas con la detección de dominio
            redirect_uri=DEV_REDIRECT_URL,
            scope=["openid", "email", "profile"],
        )
        return redirect(request_uri)
    except Exception as e:
        print(f"Error en la autenticación con Google: {str(e)}")
        return error_response(f"Error en la autenticación con Google: {str(e)}", 500)


@google_auth.route("/callback")
def callback():
    # Verificar si la autenticación de Google está configurada
    if not GOOGLE_AUTH_CONFIGURED:
        return error_response("La autenticación con Google no está configurada. Por favor, configure las credenciales de OAuth.", 501)
    
    try:
        # Obtener el código de autorización de Google
        code = request.args.get("code")
        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        token_endpoint = google_provider_cfg["token_endpoint"]

        # Preparar y enviar la solicitud de token
        token_url, headers, body = client.prepare_token_request(
            token_endpoint,
            # Usar la URL predefinida para evitar problemas de detección
            authorization_response=request.url.replace("http://", "https://"),
            redirect_url=DEV_REDIRECT_URL,
            code=code,
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
        )

        # Analizar la respuesta del token
        client.parse_request_body_response(json.dumps(token_response.json()))

        # Obtener información del usuario
        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        # Verificar que el correo electrónico está verificado por Google
        userinfo = userinfo_response.json()
        if userinfo.get("email_verified"):
            user_email = userinfo["email"]
            user_name = userinfo.get("given_name", "")
            user_last_name = userinfo.get("family_name", "")
            # Por defecto si no hay apellido, usar el nombre
            if not user_last_name:
                user_last_name = user_name
        else:
            return error_response("Correo electrónico no verificado por Google", 400)

        # Buscar si el usuario ya existe en nuestra base de datos
        with get_db_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (user_email,))
            existing_user = fetch_one_dict_from_result(cursor)

            if existing_user:
                user_id = existing_user["id"]
            else:
                # Crear un nuevo usuario con los datos de Google
                # Usamos una contraseña aleatoria que el usuario nunca necesitará
                import secrets
                random_password = secrets.token_hex(16)
                hashed_password = generate_password_hash(random_password)
                
                # Insertar el nuevo usuario
                cursor.execute(
                    "INSERT INTO users (nombre, apellido, email, password) VALUES (%s, %s, %s, %s)",
                    (user_name, user_last_name, user_email, hashed_password)
                )
                cursor.execute("COMMIT")
                
                # Obtener el ID del usuario recién creado
                cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
                user_data = fetch_one_dict_from_result(cursor)
                if user_data and "id" in user_data:
                    user_id = user_data["id"]
                else:
                    return error_response("Error al crear el usuario", 500)

        # Generar tokens y establecer cookies
        from flask_jwt_extended import set_access_cookies, set_refresh_cookies, create_refresh_token
        from config import EXPIRE_TOKEN_TIME
        from datetime import timedelta
        
        # Generar tokens y obtener el session_id
        access_token, session_id = build_token(
            user_id,
            additional_claims={
                "email": user_email,
                "nombre": user_name,
                "apellido": user_last_name,
                "auth_method": "google"
            }
        )
        
        # Generar token de refresco
        refresh_token = create_refresh_token(
            identity=user_id,
            additional_claims={
                'session_id': session_id  # Incluir session_id en el token de refresco
            },
            expires_delta=timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])
        )
        
        # Almacenar el token de refresco
        token_manager.store_refresh_token(str(user_id), refresh_token, session_id)
        
        # Preparar respuesta con redirección a dashboard
        # Redirigimos a dashboard para usuarios autenticados (o a la página principal con un parámetro de éxito)
        response_url = "/dashboard?auth_success=true"
        
        # Para evitar problemas de tipo entre respuestas de Flask y Werkzeug,
        # creamos una respuesta Flask directamente
        from flask import make_response
        resp = make_response(redirect(response_url))
        
        # Configurar cookies seguras con los tokens
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        
        # Log para depuración
        print(f"Autenticación con Google exitosa para {user_email}, redirigiendo a {response_url}")
        
        return resp
    except Exception as e:
        print(f"Error en el callback de Google: {str(e)}")
        return error_response(f"Error en la autenticación con Google: {str(e)}", 500)
