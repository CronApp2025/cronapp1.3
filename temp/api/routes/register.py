# routes/register.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from helper.validations import validate_email_format
from helper.database import get_db_cursor, fetch_one_dict_from_result
from helper.response_utils import success_response, error_response
from helper.transaction import db_transaction

register = Blueprint('register', __name__)

from helper.Middleware.rate_limiter import rate_limit

@register.route('/', methods=['POST'])
@rate_limit(max_requests=5, per_seconds=300, by_route=True)  # Límite para prevenir ataques de registro masivo
def register_usuario():
    try:
        data = request.get_json()
        print(f"Recibida solicitud de registro: {data}")

        # Validar campos requeridos
        required_fields = ['nombre', 'apellido', 'email', 'password', 'fecha_nacimiento']
        for field in required_fields:
            if field not in data:
                return error_response(f"El campo {field} es requerido", 400)

        # Validar formato de email
        if not validate_email_format(data['email']):
            return error_response("Formato de email inválido", 400)

        # Validar contraseña (requisitos más estrictos)
        password = data['password']
        if len(password) < 12:
            return error_response("La contraseña debe tener al menos 12 caracteres", 400)
        
        # Validar complejidad de contraseña
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(not c.isalnum() for c in password)
        
        if not (has_upper and has_lower and has_digit and has_special):
            return error_response("La contraseña debe incluir mayúsculas, minúsculas, números y símbolos", 400)

        # Hash de la contraseña
        hashed_password = generate_password_hash(data['password'])

        with get_db_cursor(dictionary=True) as cursor, db_transaction(cursor):
            # Verificar si el email ya existe
            cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            existing_user = fetch_one_dict_from_result(cursor)

            if existing_user:
                return error_response("El email ya está registrado", 400)

            # Insertar el nuevo usuario (adaptado para MySQL)
            insert_query = """
            INSERT INTO users (nombre, apellido, email, password, fecha_nacimiento, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """

            cursor.execute(insert_query, (
                data['nombre'],
                data['apellido'],
                data['email'],
                hashed_password,
                data['fecha_nacimiento']
            ))
            
            # Obtener el ID del usuario insertado
            user_id = cursor.lastrowid
            
            # Consultar los datos del usuario recién creado
            select_query = """
            SELECT id, nombre, apellido, email, fecha_nacimiento 
            FROM users 
            WHERE id = %s
            """
            cursor.execute(select_query, (user_id,))
            new_user = fetch_one_dict_from_result(cursor)

            if not new_user:
                raise Exception("Error al crear el usuario")

            return success_response(
                data=new_user,
                msg="Usuario registrado exitosamente"
            )

    except Exception as e:
        print(f"Error en register_usuario: {str(e)}")
        return error_response(f"Error al registrar: {str(e)}", 500)