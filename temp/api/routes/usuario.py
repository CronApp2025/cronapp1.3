# routes/usuarios.py
from flask import Blueprint, request, jsonify
from db import get_connection

from helper.validations import validate_email_format
from datetime import datetime

from helper.database import get_db_cursor
from database.procedures import *
from helper.response_utils import success_response, error_response

from helper.database import fetch_all_dict_from_result

from helper.transaction import db_transaction


from helper.database import fetch_one_dict_from_result

from flask_jwt_extended import jwt_required

usuarios = Blueprint('usuarios', __name__)


#AGREGAR USUARIO - REQUEST IN BODY
@usuarios.route('/agregar_usuario', methods=['POST'])
def agregar_usuario():
    try:
        data = request.get_json()
        
        with get_db_cursor() as cursor, db_transaction(cursor):
            cursor.callproc(USER_PROCEDURES['AGREGAR'], [
                data['nombre'],
                data['apellido'],
                data['email'],
                data['fecha_nacimiento']
            ])
            
        return success_response(
            "Usuario creado exitosamente"
        )
        
    except Exception as e:
        return error_response(f"{str(e)}")



#ACTUALIZAR USUARIO - request in body
@usuarios.route('/usuarios', methods=['PUT'])
def editar_usuario():
    try:
        data = request.get_json()
        
        with get_db_cursor() as cursor, db_transaction(cursor):
            cursor.callproc(USER_PROCEDURES['EDITAR'], [
                data['id'],
                data['nombre'],
                data['apellido'],
                data['email'],
                data['fecha_nacimiento']
            ])


            
        return success_response(
            "Usuario actualizado exitosamente"
        )
        
    except Exception as e:
        return error_response(f"{str(e)}")

#ELIMINAR USUARIO - REQUEST FROM QUERY
@usuarios.route('/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    try:
        with get_db_cursor() as cursor, db_transaction(cursor):
            cursor.callproc(USER_PROCEDURES['ELIMINAR'], [id])
            
        return success_response(
            "Usuario eliminado exitosamente"
        )
        
    except Exception as e:
        return error_response(
            f"{str(e)}",
            status_code=400
        )




# OBTENER TODOS LOS USUARIOS
@usuarios.route('/all', methods=['GET'])
def obtener_usuarios():
    try:
        with get_db_cursor() as cursor:
            cursor.callproc(USER_PROCEDURES['OBTENER_TODOS'])
            result = next(cursor.stored_results())
            usuarios = fetch_all_dict_from_result(result)
        return success_response(data=usuarios)
    
    except Exception as e:
        return error_response(f"{str(e)}")




#BUSCAR USUARIO - REQUEST FROM QUERY
@usuarios.route('/obtener_por_id56/<int:id>', methods=['GET'])
@jwt_required() 
def obtener_usuario_por_id22(id):
    try:
        
        with get_db_cursor() as cursor:
            cursor.callproc(USER_PROCEDURES['BUSCAR_POR_ID'], [id])
            result = next(cursor.stored_results())
            usuario = fetch_one_dict_from_result(result)
            if usuario is None:
                return error_response("Usuario no encontrado", 404)

        return success_response(data=usuario)
    except Exception as e:
        return error_response(f"{str(e)}")




#BUSCAR USUARIO - REQUEST IN BODY
@usuarios.route('/obtener_por_id_body', methods=['GET'])
def obtener_usuario_por_id_body2():
    try:
        data = request.get_json()
        if not data or 'id' not in data:
            return error_response("Se requiere el ID del usuario en el body", 400)
        
        user_id = data['id']
        
        with get_db_cursor() as cursor:
            cursor.callproc(USER_PROCEDURES['BUSCAR_POR_ID'], [user_id])
            result = next(cursor.stored_results())
            usuario = fetch_one_dict_from_result(result)
            if usuario is None:
                return error_response("Usuario no encontrado", 404)

        return success_response(data=usuario)

    except Exception as e:
        return error_response(f"{str(e)}")