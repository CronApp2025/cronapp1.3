"""
Módulo para manejar el onboarding de nuevos usuarios
"""
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import os
from datetime import datetime
import mysql.connector
import sys
import logging
from helper.database import get_db_cursor

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear Blueprint para onboarding
onboarding_bp = Blueprint('onboarding', __name__)

# Ruta específica para actualizar datos desde configuración
@onboarding_bp.route('/settings/onboarding', methods=['POST'])
@jwt_required()  # Mantenemos la protección para garantizar la seguridad
def update_onboarding_settings():
    """Actualiza los datos de onboarding desde la página de configuración"""
    # Usamos la misma lógica que save_onboarding
    try:
        # Obtener el ID del usuario autenticado
        current_user_id = get_jwt_identity()
        
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "message": "No se proporcionaron datos"}), 400
            
        # Preparar la estructura de datos para guardar
        plan_alimenticio = {
            "dias_frutas_semana": data.get('diasFrutasSemana', 0),
            "dias_verduras_semana": data.get('diasVerdurasSemana', 0),
            "dias_comida_rapida_semana": data.get('diasComidaRapidaSemana', 0)
        }
        
        actividad_fisica = {
            "dias_ejercicio_semana": data.get('diasEjercicioSemana', 0),
            "minutos_ejercicio_dia": data.get('minutosEjercicioDia', 0),
            "nivel_actividad": data.get('nivelActividad', 'moderado')
        }
        
        cuidado_salud = {
            "dias_control_glucosa_semana": data.get('diasControlGlucosaSemana', 0),
            "dias_medicacion_completa": data.get('diasMedicacionCompleta', 0),
            "tiene_alergias": data.get('tieneAlergias', False)
        }
        
        datos_personales = {
            "peso": data.get('peso', 0),
            "altura": data.get('altura', 0),
            "fecha_nacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', 'no_especificado')
        }
        
        # Convertir a JSON para almacenar en MySQL
        plan_alimenticio_json = json.dumps(plan_alimenticio)
        actividad_fisica_json = json.dumps(actividad_fisica)
        cuidado_salud_json = json.dumps(cuidado_salud)
        datos_personales_json = json.dumps(datos_personales)
        
        # Guardar en la base de datos MySQL
        try:
            with get_db_cursor() as cursor:
                # Verificar si existe un registro para este usuario
                cursor.execute("SELECT id FROM user_onboarding WHERE user_id = %s", (current_user_id,))
                existing_record = cursor.fetchone()
                
                if existing_record:
                    # Actualizar el registro existente
                    cursor.execute("""
                    UPDATE user_onboarding 
                    SET plan_alimenticio = %s, 
                        actividad_fisica = %s, 
                        cuidado_salud = %s,
                        datos_personales = %s,
                        completed_at = CURRENT_TIMESTAMP,
                        has_completed_onboarding = TRUE
                    WHERE user_id = %s
                    """, (
                        plan_alimenticio_json, 
                        actividad_fisica_json, 
                        cuidado_salud_json, 
                        datos_personales_json,
                        current_user_id
                    ))
                else:
                    # Insertar nuevo registro
                    cursor.execute("""
                    INSERT INTO user_onboarding 
                    (user_id, plan_alimenticio, actividad_fisica, cuidado_salud, datos_personales)
                    VALUES (%s, %s, %s, %s, %s)
                    """, (
                        current_user_id,
                        plan_alimenticio_json, 
                        actividad_fisica_json, 
                        cuidado_salud_json, 
                        datos_personales_json
                    ))
            
            return jsonify({
                "success": True, 
                "message": "Información de onboarding actualizada correctamente",
                "data": {
                    "user": {
                        "id": current_user_id,
                        "has_completed_onboarding": True
                    }
                }
            })
        except Exception as e:
            logger.error(f"Error al guardar en la base de datos: {str(e)}")
            return jsonify({"success": False, "message": "Error de conexión a la base de datos"}), 500
        
    except Exception as e:
        logger.error(f"Error al actualizar datos de onboarding: {str(e)}")
        return jsonify({"success": False, "message": f"Error al actualizar datos de onboarding: {str(e)}"}), 500

# Crear tabla de onboarding si no existe
def create_onboarding_table():
    """Crea la tabla de onboarding si no existe"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_onboarding (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(100) NOT NULL,
                plan_alimenticio JSON NOT NULL,
                actividad_fisica JSON NOT NULL,
                cuidado_salud JSON NOT NULL,
                datos_personales JSON NOT NULL,
                completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                has_completed_onboarding BOOLEAN NOT NULL DEFAULT TRUE,
                UNIQUE(user_id)
            )
            """)
            
        logger.info("Tabla de onboarding creada o verificada")
        return True
    except Exception as e:
        logger.error(f"Error al crear tabla de onboarding: {e}")
        return False

# Intentar crear la tabla al iniciar
try:
    create_onboarding_table()
except Exception as e:
    current_app.logger.error(f"Error al crear tabla de onboarding: {e}")

# Ruta para guardar datos de onboarding
@onboarding_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def save_onboarding():
    """Guarda la información de onboarding del usuario"""
    try:
        # Obtener el ID del usuario autenticado
        current_user_id = get_jwt_identity()
        
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "message": "No se proporcionaron datos"}), 400
            
        # Preparar la estructura de datos para guardar
        plan_alimenticio = {
            "dias_frutas_semana": data.get('diasFrutasSemana', 0),
            "dias_verduras_semana": data.get('diasVerdurasSemana', 0),
            "dias_comida_rapida_semana": data.get('diasComidaRapidaSemana', 0)
        }
        
        actividad_fisica = {
            "dias_ejercicio_semana": data.get('diasEjercicioSemana', 0),
            "minutos_ejercicio_dia": data.get('minutosEjercicioDia', 0),
            "nivel_actividad": data.get('nivelActividad', 'moderado')
        }
        
        cuidado_salud = {
            "dias_control_glucosa_semana": data.get('diasControlGlucosaSemana', 0),
            "dias_medicacion_completa": data.get('diasMedicacionCompleta', 0),
            "tiene_alergias": data.get('tieneAlergias', False)
        }
        
        datos_personales = {
            "peso": data.get('peso', 0),
            "altura": data.get('altura', 0),
            "fecha_nacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', 'no_especificado')
        }
        
        # Convertir a JSON para almacenar en MySQL
        plan_alimenticio_json = json.dumps(plan_alimenticio)
        actividad_fisica_json = json.dumps(actividad_fisica)
        cuidado_salud_json = json.dumps(cuidado_salud)
        datos_personales_json = json.dumps(datos_personales)
        
        # Guardar en la base de datos MySQL
        try:
            with get_db_cursor() as cursor:
                # Verificar si existe un registro para este usuario
                cursor.execute("SELECT id FROM user_onboarding WHERE user_id = %s", (current_user_id,))
                existing_record = cursor.fetchone()
                
                if existing_record:
                    # Actualizar el registro existente
                    cursor.execute("""
                    UPDATE user_onboarding 
                    SET plan_alimenticio = %s, 
                        actividad_fisica = %s, 
                        cuidado_salud = %s,
                        datos_personales = %s,
                        completed_at = CURRENT_TIMESTAMP,
                        has_completed_onboarding = TRUE
                    WHERE user_id = %s
                    """, (
                        plan_alimenticio_json, 
                        actividad_fisica_json, 
                        cuidado_salud_json, 
                        datos_personales_json,
                        current_user_id
                    ))
                else:
                    # Insertar nuevo registro
                    cursor.execute("""
                    INSERT INTO user_onboarding 
                    (user_id, plan_alimenticio, actividad_fisica, cuidado_salud, datos_personales)
                    VALUES (%s, %s, %s, %s, %s)
                    """, (
                        current_user_id,
                        plan_alimenticio_json, 
                        actividad_fisica_json, 
                        cuidado_salud_json, 
                        datos_personales_json
                    ))
            
            return jsonify({
                "success": True, 
                "message": "Información de onboarding guardada correctamente",
                "data": {
                    "user": {
                        "id": current_user_id,
                        "has_completed_onboarding": True
                    }
                }
            })
        except Exception as e:
            logger.error(f"Error al guardar en la base de datos: {str(e)}")
            return jsonify({"success": False, "message": "Error de conexión a la base de datos"}), 500
        
    except Exception as e:
        logger.error(f"Error al guardar datos de onboarding: {str(e)}")
        return jsonify({"success": False, "message": f"Error al guardar datos de onboarding: {str(e)}"}), 500

# Ruta para verificar si el usuario ha completado el onboarding
@onboarding_bp.route('/onboarding/status', methods=['GET'])
@jwt_required()
def check_onboarding_status():
    """Verifica si el usuario ha completado el onboarding"""
    try:
        # Obtener el ID del usuario autenticado
        current_user_id = get_jwt_identity()
        
        try:
            with get_db_cursor() as cursor:
                # Buscar el registro de onboarding para este usuario
                cursor.execute("""
                SELECT user_id, plan_alimenticio, actividad_fisica, cuidado_salud, 
                       datos_personales, has_completed_onboarding, completed_at 
                FROM user_onboarding 
                WHERE user_id = %s
                """, (current_user_id,))
                
                record = cursor.fetchone()
                
                if record:
                    # El usuario ha completado el onboarding
                    # Convertir de JSON strings a objetos Python
                    try:
                        plan_alimenticio = json.loads(record['plan_alimenticio'])
                        actividad_fisica = json.loads(record['actividad_fisica'])
                        cuidado_salud = json.loads(record['cuidado_salud'])
                        datos_personales = json.loads(record['datos_personales'])
                    except:
                        # Si hay error al parsear JSON, tomar directamente
                        plan_alimenticio = record['plan_alimenticio']
                        actividad_fisica = record['actividad_fisica']
                        cuidado_salud = record['cuidado_salud']
                        datos_personales = record['datos_personales']
                    
                    # Construir el objeto de datos completo
                    onboarding_data = {
                        "user_id": record['user_id'],
                        "plan_alimenticio": plan_alimenticio,
                        "actividad_fisica": actividad_fisica,
                        "cuidado_salud": cuidado_salud,
                        "datos_personales": datos_personales,
                        "completed_at": record['completed_at'].isoformat() if hasattr(record['completed_at'], 'isoformat') else record['completed_at'],
                        "has_completed_onboarding": bool(record['has_completed_onboarding'])
                    }
                    
                    return jsonify({
                        "success": True,
                        "data": {
                            "has_completed_onboarding": bool(record['has_completed_onboarding']),
                            "onboarding_data": onboarding_data
                        }
                    })
                else:
                    # Si no existe registro, el usuario no ha completado el onboarding
                    return jsonify({
                        "success": True,
                        "data": {
                            "has_completed_onboarding": False
                        }
                    })
        except Exception as db_error:
            logger.error(f"Error al consultar base de datos: {str(db_error)}")
            # Si hay un error con la base de datos, retornamos que no ha completado
            return jsonify({
                "success": True,
                "data": {
                    "has_completed_onboarding": False
                }
            })
            
    except Exception as e:
        logger.error(f"Error al verificar estado de onboarding: {str(e)}")
        return jsonify({"success": False, "message": f"Error al verificar estado de onboarding: {str(e)}"}), 500