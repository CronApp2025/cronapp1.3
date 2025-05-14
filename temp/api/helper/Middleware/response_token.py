from flask import jsonify
import jwt


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "success": False,
        "message": "Token expirado",
        "error": "token_expired"
    }), 401