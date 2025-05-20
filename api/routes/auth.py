from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from helper.Middleware.jwt_manager import jwt_required_custom
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import random, string, secrets, uuid
from config import EXPIRE_TOKEN_TIME
from helper.database import get_db_cursor, fetch_one_dict_from_result
from database.procedures import *
from helper.response_utils import success_response, error_response
from helper.transaction import db_transaction
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from helper.token_manager import token_manager
import os

# Obtener las credenciales de Google de las variables de entorno o secrets
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', "759420300435-1978tfdvh2ugducrmcd0crspn25u1a31.apps.googleusercontent.com")
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')

# Verificar si la autenticación de Google está habilitada
GOOGLE_AUTH_CONFIGURED = bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)

try:
    import sys
    from pathlib import Path
    module_path = Path(__file__).parent.parent
    if module_path not in sys.path:
        sys.path.append(str(module_path))
    from google_auth import GOOGLE_AUTH_CONFIGURED as google_auth_module_configured
    if google_auth_module_configured:
        print("Autenticación con Google configurada desde el módulo google_auth")
except ImportError:
    print("No se pudo importar la configuración de Google Auth. Usando configuración local.")

auth = Blueprint('auth', __name__)

from helper.Middleware.rate_limiter import rate_limit

@auth.route('/login', methods=['POST'])
@rate_limit(max_requests=5, per_seconds=60, by_route=True)  # Límite estricto para prevenir ataques de fuerza bruta
def login():
    try:
        # Solo registrar que se recibió una solicitud sin exponer datos
        data = request.get_json()
        if not data:
            return error_response("No se recibieron datos JSON", 400)

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return error_response("Email y contraseña son requeridos", 400)

        # Consultar usuario en la base de datos PostgreSQL
        with get_db_cursor(dictionary=True) as cursor:
            # Usar consulta directa en lugar de procedimiento almacenado
            query = "SELECT id, nombre, apellido, email, password, fecha_nacimiento FROM users WHERE email = %s"
            cursor.execute(query, (email,))
            user_data = fetch_one_dict_from_result(cursor)

            if not user_data:
                # Eliminamos log de datos sensibles
                return error_response("Credenciales inválidas", 401)

            # Verificar la contraseña
            stored_password = user_data.get('password', '')

            # FIX: Eliminar la comparación de texto plano y siempre usar hash seguro
            try:
                # Verificar si la contraseña está en un formato de hash reconocido
                if stored_password and stored_password.startswith(('pbkdf2:', 'scrypt:', 'sha256:')):
                    is_valid = check_password_hash(stored_password, password)
                else:
                    # Si no tiene un formato de hash reconocido, considerarla como inválida
                    # y forzar al usuario a usar "olvidé mi contraseña"
                    # No mostramos información sensible en logs
                    is_valid = False

                    # Actualizar a un hash aleatorio para invalidar la contraseña antigua
                    # Esto fuerza al usuario a usar el proceso de recuperación de contraseña
                    secure_password = generate_password_hash(secrets.token_urlsafe(16))
                    update_query = "UPDATE users SET password = %s, updated_at = NOW() WHERE id = %s"
                    cursor.execute(update_query, (secure_password, user_data['id']))
                    cursor.connection.commit()
                    # Eliminamos el log con información sensible
            except Exception as e:
                # Registramos error sin mostrar detalles sensibles
                is_valid = False

            if not is_valid:
                # No mostramos detalles sensibles en los logs
                return error_response("Credenciales inválidas", 401)

        # Eliminamos log con información del usuario

        # Convertir fecha_nacimiento a string si es un objeto date
        if isinstance(user_data.get('fecha_nacimiento'), datetime):
            user_data['fecha_nacimiento'] = user_data['fecha_nacimiento'].strftime('%Y-%m-%d')

        # Eliminar la contraseña del objeto de usuario antes de devolverlo
        if 'password' in user_data:
            del user_data['password']

        # Crear tokens JWT - asegurar que user_id sea string
        user_id_str = str(user_data['id'])
        # Eliminamos log de información sensible

        # Generar session_id único para esta sesión
        session_id = token_manager.generate_session_id()

        # Crear token de acceso con session_id
        access_token, _ = build_token(
            user_id=user_id_str,
            additional_claims={
                'email': user_data.get('email'),
                'nombre': user_data.get('nombre'),
                'apellido': user_data.get('apellido'),
                'fecha_nacimiento': user_data.get('fecha_nacimiento')                    
            },
            session_id=session_id
        )

        # Crear token de refresco con la misma session_id
        refresh_token = create_refresh_token(
            identity=user_id_str,
            additional_claims={
                'session_id': session_id  # Incluir session_id en el token de refresco
            },
            expires_delta=timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])
        )

        # Almacenar el token de refresco asociado con el session_id
        token_manager.store_refresh_token(user_id_str, refresh_token, session_id)

        # Generar respuesta solo con datos de usuario (sin tokens)
        # Los tokens solo se envían como cookies HttpOnly
        response_data = {
            **user_data,
            'session_id': session_id  # Informamos al cliente del session_id para que pueda usarlo en logout
        }

        # Calcular tiempos de expiración para logging
        access_exp_time = datetime.now() + timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])
        refresh_exp_time = datetime.now() + timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])

        print(f"Access token expira a las: {access_exp_time.strftime('%H:%M:%S')}")
        print(f"Refresh token expira a las: {refresh_exp_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Session ID generado: {session_id}")

        # FIX: Generar respuesta con cookies seguras
        resp = success_response(data=response_data)

        # Configurar cookies JWT seguras
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)

        return resp

    except Exception as e:
        print(f"Error en login: {str(e)}")
        return error_response(f"Error en el login: {str(e)}")

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()

        # Obtener datos del usuario desde la base de datos para incluir en el token
        with get_db_cursor(dictionary=True) as cursor:
            query = "SELECT id, nombre, apellido, email, fecha_nacimiento FROM users WHERE id = %s"
            cursor.execute(query, (current_user,))
            user_data = fetch_one_dict_from_result(cursor)

            if not user_data:
                return error_response("Usuario no encontrado", 404)

            # Convertir fecha_nacimiento a string si es un objeto date
            if isinstance(user_data.get('fecha_nacimiento'), datetime):
                user_data['fecha_nacimiento'] = user_data['fecha_nacimiento'].strftime('%Y-%m-%d')

            # Obtener session_id del token de refresco
            jwt_data = get_jwt()
            current_session_id = jwt_data.get('session_id')

            if not current_session_id:
                # Si no hay session_id, generamos uno nuevo
                current_session_id = token_manager.generate_session_id()
                print(f"Refresh sin session_id, generando nuevo: {current_session_id}")

            # Usar el mismo session_id para mantener la sesión
            new_access_token, _ = build_token(
                user_id=user_data['id'],
                additional_claims={
                    'email': user_data.get('email'),
                    'nombre': user_data.get('nombre'),
                    'apellido': user_data.get('apellido'),
                    'fecha_nacimiento': user_data.get('fecha_nacimiento')                    
                },
                session_id=current_session_id
            )

            # Token se envía solo como cookie, no en JSON
            response_data = {
                'refreshed': True,
                'session_id': current_session_id
            }

            new_exp_time = datetime.now() + timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])
            print(f"Nuevo access token expira a las: {new_exp_time.strftime('%H:%M:%S')}")
            print(f"Session ID mantenido: {current_session_id}")

            # FIX: Generar respuesta con cookies seguras
            resp = success_response(data=response_data)

            # Establecer la cookie de acceso renovada
            set_access_cookies(resp, new_access_token)

            return resp

    except Exception as e:
        print(f"Error al refrescar el token: {str(e)}")
        return error_response(f"Error al refrescar el token: {str(e)}")

@auth.route('/auth-methods', methods=['GET'])
def get_auth_methods():
    """Retorna los métodos de autenticación disponibles"""
    return success_response({
        "google_auth_available": True,
        "google_client_id": GOOGLE_CLIENT_ID
    })

@auth.route('/google', methods=['POST'])
def google_auth():
    """
    Endpoint para la autenticación con Google.
    Recibe los datos del usuario autenticado con Google y crea o actualiza el usuario en nuestra BD.
    """

    # Verificar si la autenticación de Google está habilitada
    if not GOOGLE_AUTH_CONFIGURED:
        return error_response("La autenticación con Google no está configurada en el servidor", 501)

    try:
        # Obtener datos enviados desde el frontend
        data = request.get_json()
        print("Datos recibidos de Google:", data)

        email = data.get('email')
        nombre = data.get('nombre', '')
        apellido = data.get('apellido', '')
        google_id = data.get('google_id', '')
        fecha_nacimiento = data.get('fecha_nacimiento', None)
        profile_picture = data.get('profile_picture', '')

        if not email:
            return error_response("Email es requerido", 400)

        # Verificar si el usuario ya existe por email
        with get_db_cursor(dictionary=True) as cursor:
            # Buscar usuario por email
            query = "SELECT id, nombre, apellido, email, fecha_nacimiento FROM users WHERE email = %s"
            cursor.execute(query, (email,))
            user_data = fetch_one_dict_from_result(cursor)

            is_new_user = False

            # Si el usuario no existe, crearlo
            if not user_data:
                is_new_user = True

                # Generar una contraseña aleatoria segura para usuarios de Google
                temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                hashed_password = generate_password_hash(temp_password)

                # Insertar el nuevo usuario (adaptado para MySQL)
                # Query adaptada para MySQL (sin RETURNING)
                insert_query = """
                INSERT INTO users (nombre, apellido, email, password, fecha_nacimiento, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """

                # Manejar fecha_nacimiento si está presente
                if fecha_nacimiento:
                    try:
                        # Intentar convertir a formato de fecha
                        datetime.strptime(fecha_nacimiento, '%Y-%m-%d')
                    except ValueError:
                        # Si falla, usar una fecha por defecto
                        fecha_nacimiento = '2000-01-01'
                else:
                    fecha_nacimiento = '2000-01-01'

                cursor.execute(insert_query, (nombre, apellido, email, hashed_password, fecha_nacimiento))
                # Obtener el ID insertado
                user_id = cursor.lastrowid
                conn = cursor.connection
                conn.commit()

                # Consultar el usuario recién insertado
                select_query = "SELECT id, nombre, apellido, email, fecha_nacimiento FROM users WHERE id = %s"
                cursor.execute(select_query, (user_id,))
                user_data = fetch_one_dict_from_result(cursor)

                if not user_data:
                    return error_response("Error al crear el usuario", 500)

        # Convertir fecha_nacimiento a string si es un objeto date
        if isinstance(user_data.get('fecha_nacimiento'), datetime):
            user_data['fecha_nacimiento'] = user_data['fecha_nacimiento'].strftime('%Y-%m-%d')

        # Generar session_id único para esta sesión
        session_id = token_manager.generate_session_id()

        # Generar tokens de acceso y refresco
        access_token, _ = build_token(
            user_id=user_data['id'],
            additional_claims={
                'email': user_data.get('email'),
                'nombre': user_data.get('nombre'),
                'apellido': user_data.get('apellido'),
                'fecha_nacimiento': user_data.get('fecha_nacimiento')                    
            },
            session_id=session_id
        )

        # Crear token de refresco con la misma session_id
        refresh_token = create_refresh_token(
            identity=user_data['id'],
            additional_claims={
                'session_id': session_id  # Incluir session_id en el token de refresco
            },
            expires_delta=timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])
        )

        # Almacenar el token de refresco asociado con el session_id
        token_manager.store_refresh_token(str(user_data['id']), refresh_token, session_id)

        # Preparar respuesta para el frontend (sin tokens)
        # Los tokens solo se envían como cookies HttpOnly
        response_data = {
            **user_data,
            'is_new_user': is_new_user,
            'session_id': session_id  # Informamos al cliente del session_id para que pueda usarlo en logout
        }

        # Calcular tiempos de expiración para logging
        access_exp_time = datetime.now() + timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])
        refresh_exp_time = datetime.now() + timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])

        print(f"Access token expira a las: {access_exp_time.strftime('%H:%M:%S')}")
        print(f"Refresh token expira a las: {refresh_exp_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Session ID generado para usuario Google: {session_id}")

        # FIX: Generar respuesta con cookies seguras
        resp = success_response(data=response_data)

        # Configurar cookies JWT seguras
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)

        return resp

    except Exception as e:
        print(f"Error en la autenticación con Google: {str(e)}")
        return error_response(f"Error en la autenticación con Google: {str(e)}")

@auth.route('/logout', methods=['POST'])
def logout():
    """
    Endpoint para cerrar sesión del usuario.
    Se puede llamar con o sin token activo.

    Si se tiene token, se invalida ese token y la sesión correspondiente.
    Si se proporciona un session_id en el cuerpo, se intenta invalidar esa sesión específica.
    Si se proporciona un user_id en el cuerpo, se pueden invalidar todas las sesiones de ese usuario.
    """
    try:
        # Intentar obtener datos del JWT si está disponible
        jwt_data = None
        token_user_id = None
        token_session_id = None

        # Obtener datos del cuerpo de la solicitud
        data = request.get_json(silent=True) or {}
        body_session_id = data.get('session_id')
        body_user_id = data.get('user_id')
        logout_all = data.get('all', False)  # Bandera para cerrar todas las sesiones

        try:
            # Verificar si hay un JWT y extraer sus datos
            verify_jwt_in_request(optional=True)
            try:
                jwt_data = get_jwt()
            except Exception as jwt_err:
                print(f"No hay token JWT válido: {str(jwt_err)}")
                jwt_data = None

            if jwt_data:
                token_user_id = jwt_data.get('sub')
                token_session_id = jwt_data.get('session_id')

                # Si tenemos un session_id del token, invalidarlo
                if token_session_id and token_user_id:
                    # Invalidar la sesión (esto invalida automáticamente todos los tokens asociados)
                    token_manager.revoke_session(str(token_user_id), token_session_id)
                    print(f"Sesión {token_session_id} revocada durante logout")
        except Exception as e:
            # No hay un token válido, continuamos con los datos del cuerpo
            print(f"No se pudo obtener token: {str(e)}")

        # Usar user_id del token o del cuerpo
        effective_user_id = token_user_id or body_user_id
        # Usar session_id del token o del cuerpo
        effective_session_id = token_session_id or body_session_id

        if effective_user_id:
            if logout_all:
                # Revocar todas las sesiones del usuario
                count = token_manager.revoke_all_sessions(str(effective_user_id))
                print(f"Todas las sesiones ({count}) del usuario {effective_user_id} revocadas")
            elif effective_session_id and not token_session_id:
                # Si ya revocamos la sesión del token, no necesitamos hacerlo de nuevo
                # Revocar la sesión específica
                token_manager.revoke_session(str(effective_user_id), effective_session_id)
                print(f"Sesión {effective_session_id} del usuario {effective_user_id} revocada explícitamente")

        # Crear respuesta y limpiar cookies JWT
        resp = success_response("Logout exitoso")
        unset_jwt_cookies(resp)  # Eliminar cookies de JWT

        return resp
    except Exception as e:
        print(f"Error en logout: {str(e)}")
        # Siempre devolvemos éxito en logout, incluso si hay error
        # Esto asegura que el cliente pueda completar el proceso
        resp = success_response("Logout procesado")
        unset_jwt_cookies(resp)
        return resp

@auth.route('/validate', methods=['GET', 'POST'])
@jwt_required_custom()
def validate_token():
    """
    Endpoint para validar token y obtener datos del usuario.

    Si el token es válido y la sesión está activa, devuelve los datos del usuario.
    Si el token ha expirado o la sesión ha sido revocada, devuelve 401.
    """
    try:
        jwt_data = get_jwt()
        user_id = jwt_data.get('sub')
        session_id = jwt_data.get('session_id')

        # Validar que la sesión siga activa
        if not token_manager.validate_session(str(user_id), session_id):
            print(f"Sesión {session_id} no válida para el usuario {user_id}")
            return error_response("Sesión inválida o expirada", 401)

        print(f"Sesión {session_id} validada para el usuario {user_id}")

        # Recuperar los datos del usuario y enviarlos como parte de la respuesta
        with get_db_cursor(dictionary=True) as cursor:
            query = "SELECT id, nombre, apellido, email, fecha_nacimiento FROM users WHERE id = %s"
            cursor.execute(query, (user_id,))
            user = fetch_one_dict_from_result(cursor)

        if not user:
            return error_response("Usuario no encontrado", 404)

        # Formato de fecha para enviar al cliente
        if 'fecha_nacimiento' in user and user['fecha_nacimiento']:
            if isinstance(user['fecha_nacimiento'], datetime):
                user['fecha_nacimiento'] = user['fecha_nacimiento'].strftime('%Y-%m-%d')

        # Incluir información de la sesión en la respuesta
        # incluyendo tiempo restante de validez
        session_info = None
        sessions = token_manager.get_active_sessions(str(user_id))

        for session in sessions:
            if session.get('session_id') == session_id:
                session_info = session
                break

        return success_response(data={
            'valid': True,
            'user': user,
            'session': session_info
        })
    except Exception as e:
        print(f"Error validating token: {str(e)}")
        return error_response(f"Error de validación: {str(e)}", 401)

def build_token(user_id, additional_claims=None, expires_delta=None, session_id=None):
    """
    Construye un token JWT con claims adicionales y registra la sesión asociada

    Args:
        user_id: ID del usuario (se convierte a string)
        additional_claims: Diccionario de claims adicionales
        expires_delta: Tiempo de expiración personalizado (si es None, se usa el predeterminado)
        session_id: ID de sesión único (si es None, se genera uno nuevo)

    Returns:
        Tupla con token JWT firmado y session_id
    """
    # Convertir ID a string para consistencia
    user_id = str(user_id)

    # Generar session_id si no se proporciona
    if not session_id:
        session_id = token_manager.generate_session_id()

    # Registrar o actualizar la sesión en el token manager
    session_id = token_manager.register_session(user_id, session_id)
    print(f"Sesión {session_id} registrada para usuario {user_id}")

    # Configurar expiración predeterminada si no se especifica
    if expires_delta is None:
        expires_delta = timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])

    # Claims base
    claims = {
        'session_id': session_id  # Agregar session_id para identificar la sesión
    }

    # Agregar claims adicionales
    if additional_claims:
        claims.update(additional_claims)

    # Crear token con identidad y claims
    token = create_access_token(
        identity=user_id,
        additional_claims=claims,
        expires_delta=expires_delta
    )    
    return token, session_id