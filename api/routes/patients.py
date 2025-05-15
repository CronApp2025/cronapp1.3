"""
Módulo para manejar las rutas de pacientes
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import json
import os
from datetime import datetime, timedelta
import random

# Crear Blueprint para pacientes
patients_bp = Blueprint('patients', __name__)

# Ruta base de datos mock
MOCK_DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'mock_data', 'patients.json')

# Función para cargar datos mock
def load_mock_data():
    """Carga datos de pacientes desde archivo mock"""
    try:
        if os.path.exists(MOCK_DATA_FILE):
            with open(MOCK_DATA_FILE, 'r', encoding='utf-8') as file:
                return json.load(file)
        else:
            # Directorio mock_data
            mock_dir = os.path.dirname(MOCK_DATA_FILE)
            if not os.path.exists(mock_dir):
                os.makedirs(mock_dir)
                
            # Crear datos mock por defecto
            mock_data = [
                {
                    "id": 1,
                    "fullName": "María García Rodríguez",
                    "age": 56,
                    "gender": "Femenino",
                    "status": "Activo",
                    "fecha_nacimiento": "1969-05-10",
                    "conditions": [
                        {
                            "id": 1,
                            "name": "Hipertensión",
                            "icon": "heart-pulse",
                            "lastUpdated": (datetime.now() - timedelta(days=14)).isoformat()
                        },
                        {
                            "id": 2,
                            "name": "Diabetes Tipo 2",
                            "icon": "droplet",
                            "lastUpdated": (datetime.now() - timedelta(days=7)).isoformat()
                        }
                    ]
                },
                {
                    "id": 2,
                    "fullName": "Carlos Martínez López",
                    "age": 68,
                    "gender": "Masculino",
                    "status": "Activo",
                    "fecha_nacimiento": "1957-11-22",
                    "conditions": [
                        {
                            "id": 1,
                            "name": "Hipertensión",
                            "icon": "heart-pulse",
                            "lastUpdated": (datetime.now() - timedelta(days=20)).isoformat()
                        },
                        {
                            "id": 3,
                            "name": "Asma",
                            "icon": "lungs",
                            "lastUpdated": (datetime.now() - timedelta(days=15)).isoformat()
                        }
                    ]
                },
                {
                    "id": 3,
                    "fullName": "Ana Jiménez Ortiz",
                    "age": 42,
                    "gender": "Femenino",
                    "status": "Inactivo",
                    "fecha_nacimiento": "1983-03-15",
                    "conditions": [
                        {
                            "id": 3,
                            "name": "Asma",
                            "icon": "lungs",
                            "lastUpdated": (datetime.now() - timedelta(days=45)).isoformat()
                        }
                    ]
                },
                {
                    "id": 4,
                    "fullName": "Javier Sánchez Torres",
                    "age": 74,
                    "gender": "Masculino",
                    "status": "Activo",
                    "fecha_nacimiento": "1951-08-03",
                    "conditions": [
                        {
                            "id": 4,
                            "name": "Artritis",
                            "icon": "activity",
                            "lastUpdated": (datetime.now() - timedelta(days=10)).isoformat()
                        },
                        {
                            "id": 1,
                            "name": "Hipertensión",
                            "icon": "heart-pulse",
                            "lastUpdated": (datetime.now() - timedelta(days=30)).isoformat()
                        }
                    ]
                },
                {
                    "id": 5,
                    "fullName": "Laura Fernández Ruiz",
                    "age": 61,
                    "gender": "Femenino",
                    "status": "Activo",
                    "fecha_nacimiento": "1964-12-18",
                    "conditions": [
                        {
                            "id": 5,
                            "name": "Hipotiroidismo",
                            "icon": "activity",
                            "lastUpdated": (datetime.now() - timedelta(days=5)).isoformat()
                        }
                    ]
                },
                {
                    "id": 6,
                    "fullName": "Roberto González Pérez",
                    "age": 50,
                    "gender": "Masculino",
                    "status": "Inactivo",
                    "fecha_nacimiento": "1975-05-25",
                    "conditions": []
                }
            ]
            # Guardar datos mock en archivo
            with open(MOCK_DATA_FILE, 'w', encoding='utf-8') as file:
                json.dump(mock_data, file, indent=2)
            return mock_data
    except Exception as e:
        print(f"Error cargando datos mock: {e}")
        return []

# Función para guardar datos mock
def save_mock_data(data):
    """Guarda datos de pacientes en archivo mock"""
    try:
        # Crear directorio si no existe
        mock_dir = os.path.dirname(MOCK_DATA_FILE)
        if not os.path.exists(mock_dir):
            os.makedirs(mock_dir)
            
        with open(MOCK_DATA_FILE, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando datos mock: {e}")
        return False

# Rutas de la API

@patients_bp.route('/patients', methods=['GET'])
@jwt_required(optional=True)
def get_patients():
    """Obtiene la lista de pacientes"""
    patients = load_mock_data()
    return jsonify(patients)

@patients_bp.route('/patients/<int:patient_id>', methods=['GET'])
@jwt_required(optional=True)
def get_patient(patient_id):
    """Obtiene un paciente por su ID"""
    patients = load_mock_data()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    
    if not patient:
        return jsonify({"success": False, "msg": "Paciente no encontrado"}), 404
        
    return jsonify(patient)

@patients_bp.route('/patients', methods=['POST'])
@jwt_required()
def add_patient():
    """Añade un nuevo paciente"""
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "msg": "Datos no proporcionados"}), 400
        
    patients = load_mock_data()
    
    # Generar ID
    new_id = max([p['id'] for p in patients], default=0) + 1
    
    # Crear nuevo paciente
    first_name = data.get('nombre', '')
    last_name = data.get('apellido', '')
    fecha_nacimiento = data.get('fecha_nacimiento', '')
    gender = data.get('gender', 'Masculino')
    
    # Calcular edad
    try:
        birth_date = datetime.strptime(fecha_nacimiento, "%Y-%m-%d")
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except:
        age = 0
    
    new_patient = {
        "id": new_id,
        "fullName": f"{first_name} {last_name}",
        "age": age,
        "gender": gender,
        "status": "Activo",
        "fecha_nacimiento": fecha_nacimiento,
        "conditions": []
    }
    
    patients.append(new_patient)
    save_mock_data(patients)
    
    return jsonify({"success": True, "msg": "Paciente añadido", "data": new_patient}), 201

@patients_bp.route('/patients/<int:patient_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_patient(patient_id):
    """Actualiza un paciente existente"""
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "msg": "Datos no proporcionados"}), 400
        
    patients = load_mock_data()
    
    patient_index = next((i for i, p in enumerate(patients) if p['id'] == patient_id), None)
    
    if patient_index is None:
        return jsonify({"success": False, "msg": "Paciente no encontrado"}), 404
    
    # Actualizar nombre si se proporciona
    if 'nombre' in data or 'apellido' in data:
        current_name_parts = patients[patient_index]['fullName'].split(' ', 1)
        first_name = data.get('nombre', current_name_parts[0] if len(current_name_parts) > 0 else '')
        last_name = data.get('apellido', current_name_parts[1] if len(current_name_parts) > 1 else '')
        patients[patient_index]['fullName'] = f"{first_name} {last_name}"
    
    # Actualizar otros campos
    if 'fecha_nacimiento' in data:
        patients[patient_index]['fecha_nacimiento'] = data['fecha_nacimiento']
        # Recalcular edad
        try:
            birth_date = datetime.strptime(data['fecha_nacimiento'], "%Y-%m-%d")
            today = datetime.now()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            patients[patient_index]['age'] = age
        except:
            pass
    
    if 'gender' in data:
        patients[patient_index]['gender'] = data['gender']
    
    if 'status' in data:
        patients[patient_index]['status'] = data['status']
    
    save_mock_data(patients)
    
    return jsonify({"success": True, "msg": "Paciente actualizado", "data": patients[patient_index]})

@patients_bp.route('/patients/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Elimina un paciente"""
    patients = load_mock_data()
    
    patient_index = next((i for i, p in enumerate(patients) if p['id'] == patient_id), None)
    
    if patient_index is None:
        return jsonify({"success": False, "msg": "Paciente no encontrado"}), 404
    
    deleted_patient = patients.pop(patient_index)
    save_mock_data(patients)
    
    return jsonify({"success": True, "msg": "Paciente eliminado", "data": deleted_patient})

@patients_bp.route('/patients/<int:patient_id>/conditions', methods=['GET'])
@jwt_required(optional=True)
def get_patient_conditions(patient_id):
    """Obtiene las condiciones médicas de un paciente"""
    patients = load_mock_data()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    
    if not patient:
        return jsonify({"success": False, "msg": "Paciente no encontrado"}), 404
    
    # Lista de condiciones médicas detalles
    conditions = [
        {
            "id": 1,
            "name": "Hipertensión",
            "type": "chronic",
            "diagnosed_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "metrics": [
                {
                    "id": 1,
                    "key": "systolic",
                    "name": "Sistólica",
                    "value": str(random.randint(130, 160)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                    "label": "mmHg",
                    "valueColor": "#EF4444" if random.random() > 0.5 else "#F97316"
                },
                {
                    "id": 2,
                    "key": "diastolic",
                    "name": "Diastólica",
                    "value": str(random.randint(80, 100)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                    "label": "mmHg",
                    "valueColor": "#F97316" if random.random() > 0.5 else None
                }
            ],
            "icon": "heart-pulse",
            "color": "#EF4444",
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
        },
        {
            "id": 2,
            "name": "Diabetes Tipo 2",
            "type": "chronic",
            "diagnosed_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "metrics": [
                {
                    "id": 4,
                    "key": "glucose",
                    "name": "Glucosa",
                    "value": str(random.randint(120, 180)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                    "label": "mg/dL",
                    "valueColor": "#F97316" if random.random() > 0.5 else None
                },
                {
                    "id": 5,
                    "key": "hba1c",
                    "name": "HbA1c",
                    "value": str(round(random.uniform(6.5, 8.0), 1)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                    "label": "%",
                    "valueColor": "#F97316" if random.random() > 0.5 else None
                }
            ],
            "icon": "droplet",
            "color": "#3B82F6",
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
        },
        {
            "id": 3,
            "name": "Asma",
            "type": "chronic",
            "diagnosed_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "metrics": [
                {
                    "id": 7,
                    "key": "peak_flow",
                    "name": "Flujo máximo",
                    "value": str(random.randint(350, 450)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                    "label": "L/min",
                    "valueColor": None
                }
            ],
            "icon": "lungs",
            "color": "#22C55E",
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
        },
        {
            "id": 4,
            "name": "Artritis",
            "type": "chronic",
            "diagnosed_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "metrics": [
                {
                    "id": 9,
                    "key": "pain_level",
                    "name": "Nivel de dolor",
                    "value": str(random.randint(3, 8)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                    "label": "/10",
                    "valueColor": "#F97316" if random.random() > 0.5 else None
                }
            ],
            "icon": "activity",
            "color": "#EC4899",
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
        },
        {
            "id": 5,
            "name": "Hipotiroidismo",
            "type": "chronic",
            "diagnosed_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "metrics": [
                {
                    "id": 11,
                    "key": "tsh",
                    "name": "TSH",
                    "value": str(round(random.uniform(3.5, 6.0), 2)),
                    "date_recorded": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                    "label": "mIU/L",
                    "valueColor": "#F97316" if random.random() > 0.5 else None
                }
            ],
            "icon": "activity",
            "color": "#A855F7",
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
        }
    ]
    
    # Filtrar condiciones que tiene el paciente
    patient_condition_ids = [c['id'] for c in patient.get('conditions', [])]
    filtered_conditions = [c for c in conditions if c['id'] in patient_condition_ids]
    
    return jsonify(filtered_conditions)

@patients_bp.route('/patients/<int:patient_id>/alerts', methods=['GET'])
@jwt_required(optional=True)
def get_patient_alerts(patient_id):
    """Obtiene las alertas de un paciente"""
    patients = load_mock_data()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    
    if not patient:
        return jsonify({"success": False, "msg": "Paciente no encontrado"}), 404
    
    # Alertas aleatorias basadas en las condiciones del paciente
    alerts = []
    patient_conditions = patient.get('conditions', [])
    
    if any(c['id'] == 1 for c in patient_conditions):  # Hipertensión
        alerts.append({
            "id": len(alerts) + 1,
            "patientId": str(patient_id),
            "description": "Presión arterial elevada durante varios días consecutivos",
            "level": random.randint(2, 3),
            "days": random.randint(2, 5),
            "alertType": "warning" if random.random() > 0.5 else "critical",
            "time": datetime.now().strftime("%H:%M"),
            "riskLevel": random.randint(70, 90),
            "riskColor": "#F44336" if random.random() > 0.5 else "#FF9800"
        })
    
    if any(c['id'] == 2 for c in patient_conditions):  # Diabetes
        alerts.append({
            "id": len(alerts) + 1,
            "patientId": str(patient_id),
            "description": "Nivel de glucosa fuera del rango objetivo",
            "level": random.randint(1, 3),
            "days": random.randint(1, 3),
            "alertType": "warning" if random.random() > 0.7 else "notice",
            "time": datetime.now().strftime("%H:%M"),
            "riskLevel": random.randint(50, 75),
            "riskColor": "#FF9800"
        })
    
    if any(c['id'] == 3 for c in patient_conditions):  # Asma
        alerts.append({
            "id": len(alerts) + 1,
            "patientId": str(patient_id),
            "description": "Disminución en mediciones de flujo respiratorio",
            "level": random.randint(1, 2),
            "days": random.randint(1, 3),
            "alertType": "notice",
            "time": datetime.now().strftime("%H:%M"),
            "riskLevel": random.randint(30, 60),
            "riskColor": "#3B82F6"
        })
    
    # Si no hay condiciones o alertas, crear una alerta genérica
    if not alerts:
        alerts.append({
            "id": 1,
            "patientId": str(patient_id),
            "description": "No ha reportado mediciones recientemente",
            "level": 1,
            "days": random.randint(5, 10),
            "alertType": "notice",
            "time": datetime.now().strftime("%H:%M"),
            "riskLevel": 30,
            "riskColor": "#3B82F6"
        })
    
    return jsonify(alerts)