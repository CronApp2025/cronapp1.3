
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
                
                # Verificar si el token está en la denylist
                if token_manager.is_denied(jwt.get('jti', '')):
                    print(f"Token JTI {jwt.get('jti', '')} está en la denylist")
                    return jsonify({"msg": "Token ha sido revocado"}), 401
                
                # Verificar session_id si existe en el token
                if 'session_id' in jwt and 'sub' in jwt:
                    session_id = jwt.get('session_id')
                    user_id = jwt.get('sub')
                    
                    # Solo validamos refresh tokens
                    if refresh and session_id:
                        # Verificar si el token de refresco es válido para esta sesión
                        if not token_manager.validate_refresh_token(str(user_id), jwt.get('refresh_token', ''), session_id):
                            print(f"Sesión {session_id} inválida para usuario {user_id}")
                            return jsonify({"msg": "Sesión inválida"}), 401
                
                return fn(*args, **kwargs)
            except Exception as e:
                print(f"Error en validación de token: {str(e)}")
                if optional:
                    return fn(*args, **kwargs)
                return jsonify({"msg": "Token inválido", "error": str(e)}), 401
        return decorator
    return wrapper
