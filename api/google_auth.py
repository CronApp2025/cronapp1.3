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

GOOGLE_CLIENT_ID = os.environ["GOOGLE_OAUTH_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_OAUTH_CLIENT_SECRET"]
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Configure la URL de redirección usando el dominio de desarrollo de Replit
DEV_REDIRECT_URL = f'https://{os.environ.get("REPLIT_SLUG", "")}.{os.environ.get("REPLIT_CLUSTER", "")}.repl.co/api/google_auth/callback'

print(f"""Para hacer que la autenticación con Google funcione:
1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un nuevo OAuth 2.0 Client ID
3. Añade {DEV_REDIRECT_URL} a las URLs de redirección autorizadas

Para instrucciones detalladas, consulta:
https://docs.replit.com/additional-resources/google-auth-in-flask#set-up-your-oauth-app--client
""")

client = WebApplicationClient(GOOGLE_CLIENT_ID)

google_auth = Blueprint("google_auth", __name__, url_prefix="/api/google_auth")

token_manager = TokenManager()

@google_auth.route("/login")
def login():
    # Obtener la URL de autorización de Google
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Construir la solicitud de redirección a Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        # Reemplazar http:// con https:// importante para que coincida con la URI en la lista blanca
        redirect_uri=request.base_url.replace("http://", "https://") + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@google_auth.route("/callback")
def callback():
    # Obtener el código de autorización de Google
    code = request.args.get("code")
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Preparar y enviar la solicitud de token
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        # Reemplazar http:// con https:// importante para que coincida con la URI en la lista blanca
        authorization_response=request.url.replace("http://", "https://"),
        redirect_url=request.base_url.replace("http://", "https://"),
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
            cursor.connection.commit()
            
            # Obtener el ID del usuario recién creado
            cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
            user_id = fetch_one_dict_from_result(cursor)["id"]

    # Generar tokens y establecer cookies
    access_token, session_id = build_token(
        user_id,
        additional_claims={
            "email": user_email,
            "nombre": user_name,
            "apellido": user_last_name,
            "auth_method": "google"
        }
    )

    # Preparar respuesta
    user_data = {
        "id": user_id,
        "nombre": user_name,
        "apellido": user_last_name,
        "email": user_email,
        "session_id": session_id
    }

    # Redirigir a la página principal con un parámetro que indique login exitoso
    # Asumimos que la página principal está servida por Vite en modo desarrollo
    if os.environ.get("FLASK_ENV") == "development":
        return redirect("http://localhost:5173/?login_success=true")
    else:
        # En producción, redirigimos a la ruta raíz
        return redirect("/?login_success=true")
