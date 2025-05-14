
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from ..token_manager import token_manager

def jwt_required_custom(optional=False, refresh=False):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=optional, refresh=refresh)
                jwt = get_jwt()
                
                if not jwt:
                    return jsonify({"msg": "Token no proporcionado"}), 401
                
                # Verificar si la sesión está en la denylist (invalidada)
                session_id = jwt.get('session_id', '')
                if session_id and token_manager.is_denied(session_id):
                    print(f"Sesión {session_id} ha sido revocada")
                    return jsonify({"msg": "La sesión ha sido revocada"}), 401
                
                # Verificar session_id si existe en el token
                if 'session_id' in jwt and 'sub' in jwt:
                    session_id = jwt.get('session_id')
                    user_id = jwt.get('sub')
                    
                    # Solo validamos la sesión para todos los tokens
                    if session_id:
                        # Verificar si la sesión está activa para este usuario
                        if not token_manager.validate_session(str(user_id), session_id):
                            print(f"Sesión {session_id} inválida para usuario {user_id}")
                            return jsonify({"msg": "Sesión inválida o expirada"}), 401
                
                return fn(*args, **kwargs)
            except Exception as e:
                print(f"Error en validación de token: {str(e)}")
                if optional:
                    return fn(*args, **kwargs)
                return jsonify({"msg": "Token inválido", "error": str(e)}), 401
        return decorator
    return wrapper
