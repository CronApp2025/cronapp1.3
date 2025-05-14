
from flask import Blueprint, request, current_app
from helper.database import get_db_cursor
from helper.response_utils import success_response, error_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

settings = Blueprint('settings', __name__)

@settings.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return error_response("No autenticado", 401)

        current_app.logger.info(f"Obteniendo configuración para usuario ID: {user_id}")
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT id, nombre, apellido, email, fecha_nacimiento
                FROM users 
                WHERE id = %s
            """, (user_id,))
            user = cursor.fetchone()
            
            if not user:
                current_app.logger.warning(f"Usuario no encontrado: {user_id}")
                return error_response("Usuario no encontrado", 404)
            
            # Formatear fecha_nacimiento si existe
            fecha_nacimiento = None
            if user['fecha_nacimiento']:
                try:
                    fecha_nacimiento = user['fecha_nacimiento'].strftime('%Y-%m-%d')
                except Exception as e:
                    current_app.logger.error(f"Error al formatear fecha: {str(e)}")
                    fecha_nacimiento = str(user['fecha_nacimiento'])
            
            result = {
                'id': user['id'],
                'nombre': user['nombre'],
                'apellido': user['apellido'],
                'email': user['email'],
                'fecha_nacimiento': fecha_nacimiento
            }
            
            current_app.logger.info(f"Configuración obtenida con éxito: {result}")
            return success_response(result)
            
    except Exception as e:
        current_app.logger.error(f"Error en get_settings: {str(e)}")
        return error_response(f"Error interno del servidor: {str(e)}", 500)

@settings.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return error_response("No autenticado", 401)

        data = request.get_json()
        current_app.logger.info(f"Actualizando configuración para usuario ID {user_id}: {data}")
        
        if not data:
            return error_response("Datos no proporcionados", 400)

        # Validaciones básicas
        required_fields = ['nombre', 'apellido', 'email']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            return error_response(f"Faltan campos requeridos: {', '.join(missing)}", 400)

        # Asignar fecha_nacimiento vacía si no se proporciona
        if 'fecha_nacimiento' not in data or not data['fecha_nacimiento']:
            data['fecha_nacimiento'] = None
            current_app.logger.info("Fecha de nacimiento no proporcionada, se usará NULL")

        with get_db_cursor() as cursor:
            # Primero verificamos si el email ya existe
            cursor.execute("""
                SELECT id FROM users 
                WHERE email = %s AND id != %s
            """, (data['email'], user_id))
            
            if cursor.fetchone():
                return error_response("El email ya está en uso", 400)

            try:
                # Actualizamos el usuario (adaptado para MySQL - sin RETURNING)
                update_query = """
                    UPDATE users 
                    SET 
                        nombre = %s,
                        apellido = %s,
                        email = %s,
                        fecha_nacimiento = %s,
                        updated_at = NOW()
                    WHERE id = %s
                """
                params = (
                    data['nombre'],
                    data['apellido'],
                    data['email'],
                    data['fecha_nacimiento'],
                    user_id
                )
                
                current_app.logger.info(f"Ejecutando consulta: {update_query} con parámetros: {params}")
                cursor.execute(update_query, params)
                
                # Realizar commit después de la actualización
                cursor.connection.commit()
                
                # Ahora consultamos los datos actualizados
                select_query = """
                    SELECT id, nombre, apellido, email, fecha_nacimiento
                    FROM users
                    WHERE id = %s
                """
                cursor.execute(select_query, (user_id,))
                updated_user = cursor.fetchone()

                if not updated_user:
                    current_app.logger.warning(f"No se pudo actualizar el usuario {user_id}")
                    return error_response("No se pudo actualizar el usuario", 404)

                # Formatear fecha_nacimiento si existe
                fecha_nacimiento = None
                if updated_user['fecha_nacimiento']:
                    try:
                        fecha_nacimiento = updated_user['fecha_nacimiento'].strftime('%Y-%m-%d')
                    except Exception as e:
                        current_app.logger.error(f"Error al formatear fecha: {str(e)}")
                        fecha_nacimiento = str(updated_user['fecha_nacimiento'])
                
                result = {
                    'id': updated_user['id'],
                    'nombre': updated_user['nombre'],
                    'apellido': updated_user['apellido'],
                    'email': updated_user['email'],
                    'fecha_nacimiento': fecha_nacimiento
                }
                
                current_app.logger.info(f"Usuario actualizado con éxito: {result}")
                return success_response(result)
                
            except Exception as db_error:
                cursor.connection.rollback()
                current_app.logger.error(f"Error en la consulta de actualización: {str(db_error)}")
                return error_response(f"Error en la actualización: {str(db_error)}", 500)

    except Exception as e:
        current_app.logger.error(f"Error en update_settings: {str(e)}")
        return error_response(f"Error interno del servidor: {str(e)}", 500)
