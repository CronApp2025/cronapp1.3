"""
Módulo para manejar el onboarding de nuevos usuarios
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import os
from datetime import datetime

# Crear Blueprint para onboarding
onboarding_bp = Blueprint('onboarding', __name__)

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
            
        # Aquí se guardarían los datos en la base de datos real
        # Por ahora, guardamos en un archivo JSON para simular el comportamiento
        
        # Preparar la estructura de datos para guardar
        onboarding_data = {
            "user_id": current_user_id,
            "plan_alimenticio": {
                "dias_frutas_semana": data.get('diasFrutasSemana', 0),
                "dias_verduras_semana": data.get('diasVerdurasEmana', 0),
                "dias_comida_rapida_semana": data.get('diasComidaRapidaSemana', 0)
            },
            "actividad_fisica": {
                "dias_ejercicio_semana": data.get('diasEjercicioSemana', 0),
                "minutos_ejercicio_dia": data.get('minutosEjercicioDia', 0),
                "tipo_ejercicio": data.get('tipoEjercicio', '')
            },
            "cuidado_salud": {
                "dias_control_glucosa_semana": data.get('diasControlGlucosaSemana', 0),
                "dias_revision_pies_semana": data.get('diasRevisionPiesSemana', 0),
                "tomas_medicamentos": data.get('tomasMedicamentos', ''),
                "visita_medico_regular": data.get('visitaMedicoRegular', False),
                "control_enfermedades": data.get('controlEnfermedades', False)
            },
            "datos_personales": {
                "peso": data.get('peso', 0),
                "altura": data.get('altura', 0),
                "imc": data.get('imc', 0),
                "fecha_nacimiento": data.get('fechaNacimiento', ''),
                "sexo": data.get('sexo', ''),
                "actividad_laboral": data.get('actividadLaboral', ''),
                "historial_familiar": data.get('historialFamiliar', False)
            },
            "completed_at": datetime.now().isoformat(),
            "has_completed_onboarding": True
        }
        
        # Directorio para datos de onboarding
        onboarding_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'mock_data')
        if not os.path.exists(onboarding_dir):
            os.makedirs(onboarding_dir)
            
        # Archivo para este usuario específico
        onboarding_file = os.path.join(onboarding_dir, f'onboarding_{current_user_id}.json')
        
        # Guardar datos
        with open(onboarding_file, 'w', encoding='utf-8') as file:
            json.dump(onboarding_data, file, indent=2, default=str)
        
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
        return jsonify({"success": False, "message": f"Error al guardar datos de onboarding: {str(e)}"}), 500

# Ruta para verificar si el usuario ha completado el onboarding
@onboarding_bp.route('/onboarding/status', methods=['GET'])
@jwt_required()
def check_onboarding_status():
    """Verifica si el usuario ha completado el onboarding"""
    try:
        # Obtener el ID del usuario autenticado
        current_user_id = get_jwt_identity()
        
        # Archivo para este usuario específico
        onboarding_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'mock_data')
        onboarding_file = os.path.join(onboarding_dir, f'onboarding_{current_user_id}.json')
        
        # Verificar si existe el archivo de onboarding para este usuario
        if os.path.exists(onboarding_file):
            # Leer datos
            with open(onboarding_file, 'r', encoding='utf-8') as file:
                onboarding_data = json.load(file)
                
            has_completed = onboarding_data.get('has_completed_onboarding', False)
            
            return jsonify({
                "success": True,
                "data": {
                    "has_completed_onboarding": has_completed,
                    "onboarding_data": onboarding_data
                }
            })
        else:
            # Si no existe, el usuario no ha completado el onboarding
            return jsonify({
                "success": True,
                "data": {
                    "has_completed_onboarding": False
                }
            })
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Error al verificar estado de onboarding: {str(e)}"}), 500