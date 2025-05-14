from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os
import json

# Crear la aplicación Flask para mock
app = Flask(__name__)
CORS(app)  # Permitir CORS

# Ruta de prueba
@app.route('/', methods=['GET'])
def test_route():
    return jsonify({
        'status': 'success',
        'message': 'Flask API server is running'
    })

# Configuración
app.config['SECRET_KEY'] = 'clave-secreta-cronapp-demo'
TOKEN_EXPIRY_MINUTES = 60

# Archivo para persistencia de usuarios
USERS_FILE = 'api/users_data.json'

# Cargar usuarios desde archivo si existe
def load_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        else:
            # Usuario predeterminado si no existe archivo
            default_users = [
                {
                    'id': 1,
                    'nombre': 'Juan',
                    'apellido': 'Pérez',
                    'email': 'juan@email.com',
                    'fecha_nacimiento': '1990-01-01',
                    'password_hash': generate_password_hash('123456')  # Contraseña inicial
                }
            ]
            # Guardar usuario predeterminado
            save_users(default_users)
            return default_users
    except Exception as e:
        print(f"Error cargando usuarios: {e}")
        return []

# Guardar usuarios en archivo
def save_users(users):
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        print(f"Error guardando usuarios: {e}")

# Base de datos en memoria para testing (cargada desde archivo)
users_db = load_users()

# Endpoint para login con Google
@app.route('/api/auth/google', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        
        # Validar datos mínimos requeridos de un login de Google
        if not data or not data.get('email') or not data.get('nombre'):
            return jsonify({
                'status': 'error',
                'message': 'Datos de Google incompletos'
            }), 400
            
        # Verificar si el usuario ya existe
        user = next((u for u in users_db if u['email'] == data['email']), None)
        
        # Si no existe, creamos un nuevo usuario con los datos de Google
        if not user:
            # Generar una contraseña aleatoria segura
            import random, string
            random_password = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            # Crear nuevo usuario con datos de Google
            new_user = {
                'id': len(users_db) + 1,
                'nombre': data['nombre'],
                'apellido': data.get('apellido', ''),  # Podría no venir en la data de Google
                'email': data['email'],
                'fecha_nacimiento': data.get('fecha_nacimiento', ''),  # Podría no venir
                'password_hash': generate_password_hash(random_password),  # Contraseña aleatoria
                'google_id': data.get('google_id', ''),  # ID de usuario en Google
                'is_google_user': True
            }
            
            users_db.append(new_user)
            save_users(users_db)  # Guardar en archivo
            
            user = new_user  # Usar el nuevo usuario para el login
            
        # Generar token
        token_data = {
            'user_id': user['id'],
            'email': user['email'],
            'nombre': user['nombre'],
            'apellido': user['apellido'],
            'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
        }
        
        access_token = jwt.encode(token_data, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Crear respuesta
        response_data = {
            'id': user['id'],
            'nombre': user['nombre'],
            'apellido': user['apellido'],
            'email': user['email'],
            'fecha_nacimiento': user.get('fecha_nacimiento', ''),
            'access_token': access_token,
            'is_new_user': not user.get('id') == len(users_db)  # Indicar si es un usuario nuevo
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Login con Google exitoso',
            'data': response_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error en login con Google: {str(e)}'
        }), 500

# Endpoints
@app.route('/api/users/agregar_usuario', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        
        # Verificar si el email ya existe
        if any(user['email'] == data['email'] for user in users_db):
            return jsonify({
                'status': 'error',
                'message': 'Este correo ya está registrado'
            }), 400
        
        # Crear nuevo usuario
        new_user = {
            'id': len(users_db) + 1,
            'nombre': data['nombre'],
            'apellido': data['apellido'],
            'email': data['email'],
            'fecha_nacimiento': data['fecha_nacimiento'],
            'password_hash': generate_password_hash(data.get('password', '123456'))  # Contraseña por defecto
        }
        
        users_db.append(new_user)
        
        # Guardar usuarios actualizados en archivo
        save_users(users_db)
        
        return jsonify({
            'status': 'success',
            'message': 'Usuario creado exitosamente'
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validar datos
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Email y contraseña son requeridos'
            }), 400
        
        # Buscar usuario
        user = next((u for u in users_db if u['email'] == data['email']), None)
        
        # Verificar credenciales
        if not user or not check_password_hash(user['password_hash'], data['password']):
            return jsonify({
                'status': 'error',
                'message': 'Credenciales inválidas'
            }), 401
        
        # Generar token
        token_data = {
            'user_id': user['id'],
            'email': user['email'],
            'nombre': user['nombre'],
            'apellido': user['apellido'],
            'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
        }
        
        access_token = jwt.encode(token_data, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Crear respuesta
        response_data = {
            'id': user['id'],
            'nombre': user['nombre'],
            'apellido': user['apellido'],
            'email': user['email'],
            'fecha_nacimiento': user['fecha_nacimiento'],
            'access_token': access_token
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Login exitoso',
            'data': response_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error de login: {str(e)}'
        }), 500

@app.route('/api/users/all', methods=['GET'])
def get_all_users():
    try:
        # Eliminar el password_hash de la respuesta
        users_response = [{k: v for k, v in user.items() if k != 'password_hash'} for user in users_db]
        
        return jsonify({
            'status': 'success',
            'data': users_response
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    try:
        # Buscar usuario
        user = next((u for u in users_db if u['id'] == id), None)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        # Eliminar el password_hash de la respuesta
        user_response = {k: v for k, v in user.items() if k != 'password_hash'}
        
        return jsonify({
            'status': 'success',
            'data': user_response
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/recover/solicitar_recuperacion', methods=['POST'])
def request_password_recovery():
    try:
        data = request.get_json()
        
        # Validar datos
        if not data or not data.get('email'):
            return jsonify({
                'status': 'error',
                'message': 'Email es requerido'
            }), 400
        
        # Buscar usuario
        user = next((u for u in users_db if u['email'] == data['email']), None)
        
        # Por seguridad, siempre devolvemos éxito incluso si el usuario no existe
        if not user:
            return jsonify({
                'status': 'success',
                'message': 'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
            }), 200
        
        # Generar token
        import secrets
        token = secrets.token_urlsafe(32)
        
        # Almacenar token (en un archivo aparte, en producción sería en BD)
        reset_tokens_file = 'api/reset_tokens.json'
        
        try:
            if os.path.exists(reset_tokens_file):
                with open(reset_tokens_file, 'r') as f:
                    reset_tokens = json.load(f)
            else:
                reset_tokens = []
                
            # Añadir el nuevo token con tiempo de expiración (6 minutos)
            expiration_time = (datetime.utcnow() + timedelta(minutes=6)).isoformat()
            reset_tokens.append({
                'token': token,
                'user_id': user['id'],
                'expiration': expiration_time,
                'used': False
            })
            
            # Guardar tokens
            with open(reset_tokens_file, 'w') as f:
                json.dump(reset_tokens, f, indent=2)
                
        except Exception as token_error:
            print(f"Error guardando token: {token_error}")
            # Continuamos de todas formas
        
        # Crear URL para el frontend
        frontend_base_url = request.headers.get('Origin', 'http://localhost:5000')
        reset_url = f"{frontend_base_url}/reset-password/{token}"
        
        # En un caso real, aquí enviaríamos un email con el enlace
        print(f"[MOCK] Enlace de recuperación para {user['email']}: {reset_url}")
        
        return jsonify({
            'status': 'success',
            'message': 'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
        
@app.route('/api/recover/resetear_password/<token>', methods=['POST'])
def reset_password(token):
    try:
        data = request.get_json()
        
        if not data or not data.get('new_password'):
            return jsonify({
                'status': 'error',
                'message': 'La nueva contraseña es requerida'
            }), 400
            
        new_password = data['new_password']
        
        # Validar la contraseña
        if len(new_password) < 8:
            return jsonify({
                'status': 'error',
                'message': 'La contraseña debe tener al menos 8 caracteres'
            }), 400
            
        # Verificar el token
        reset_tokens_file = 'api/reset_tokens.json'
        if not os.path.exists(reset_tokens_file):
            return jsonify({
                'status': 'error',
                'message': 'Token inválido o expirado'
            }), 400
            
        try:
            with open(reset_tokens_file, 'r') as f:
                reset_tokens = json.load(f)
                
            # Buscar el token
            token_data = next((t for t in reset_tokens if t['token'] == token and not t['used']), None)
            
            if not token_data:
                return jsonify({
                    'status': 'error',
                    'message': 'Token inválido o ya utilizado'
                }), 400
                
            # Verificar expiración
            expiration_time = datetime.fromisoformat(token_data['expiration'])
            if datetime.utcnow() > expiration_time:
                return jsonify({
                    'status': 'error',
                    'message': 'El token ha expirado'
                }), 400
                
            # Buscar el usuario
            user_id = token_data['user_id']
            user = next((u for u in users_db if u['id'] == user_id), None)
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'Usuario no encontrado'
                }), 404
                
            # Actualizar la contraseña - IMPORTANTE: Usar bcrypt igual que en Express
            import bcrypt
            salt = bcrypt.gensalt(10)
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')
            
            # Actualizar contraseña en el usuario
            user['password_hash'] = hashed_password
            
            # Guardar usuarios actualizados
            save_users(users_db)
            
            # Marcar token como usado
            token_data['used'] = True
            
            # Guardar tokens actualizados
            with open(reset_tokens_file, 'w') as f:
                json.dump(reset_tokens, f, indent=2)
                
            return jsonify({
                'status': 'success',
                'message': 'Contraseña actualizada exitosamente'
            }), 200
            
        except Exception as token_error:
            print(f"Error procesando token: {token_error}")
            return jsonify({
                'status': 'error',
                'message': f'Error procesando token: {str(token_error)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al restablecer contraseña: {str(e)}'
        }), 500

# Función para iniciar el servidor mock
def start_mock_server():
    app.run(host='0.0.0.0', port=5001, debug=True)

if __name__ == '__main__':
    start_mock_server()