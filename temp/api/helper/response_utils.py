# helpers/response_utils.py
from flask import jsonify
import json
from flask import Response

def build_response(success, msg=None, data=None, status_code=200):
    """
    Construye una respuesta JSON con formato estandarizado.
    
    FIX: Modificado para devolver solo el objeto Response, no una tupla,
    para permitir la modificación de cookies y headers antes de enviar.
    """
    response = {
        'success': success,
        'msg': msg,
        'data': data if data is not None else []
    }
    json_str = json.dumps(response, ensure_ascii=False, default=str)
    resp = Response(json_str, mimetype='application/json')
    resp.status_code = status_code
    return resp

def success_response(data=None, msg="Operación exitosa"):
    """Devuelve una respuesta exitosa"""
    return build_response(True, msg, data, 200)

def error_response(msg="Error inesperado", status_code=400, data=[]):
    """Devuelve una respuesta de error"""
    return build_response(False, msg.replace("1644 (45000): ","").replace("1062 (23000): ",""), data, status_code)