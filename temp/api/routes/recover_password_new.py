from itsdangerous import URLSafeTimedSerializer as Serializer

from database.procedures import PASSWORD_PROCEDURES
from flask_mail import Message
from datetime import datetime, timedelta

from flask import Blueprint, app, current_app, render_template, request, url_for
from helper.database import fetch_one_dict_from_result, get_db_cursor

from helper.response_utils import success_response, error_response



from utils.extensions import get_password_serializer,mail

recover_password = Blueprint('recover', __name__)


@recover_password.route('/solicitar_recuperacion', methods=['POST'])
def solicitar_recuperacion():
    try:
        data = request.get_json()
        email = data['email']
        
        with get_db_cursor() as cursor:
            try:
                # 1. Verificar usuario
                cursor.callproc(PASSWORD_PROCEDURES['REQUEST_RESET'], [email])
                results = cursor.stored_results()
                try:
                    result = next(results)
                    usuario = fetch_one_dict_from_result(result)
                    
                    if not usuario:
                        return error_response("El email no está registrado", 404)
                except StopIteration:
                    return error_response("Error al procesar la solicitud", 500)
                
                # 2. Generar token
                serializer = Serializer(
                    current_app.config['SECRET_KEY'],
                    salt=current_app.config.get('SECURITY_PASSWORD_SALT', 'password-reset-salt')
                )
                token = serializer.dumps(email)
                current_app.logger.info(f"Token generado para {email}: {token}")
                
                # 3. Guardar token - Ahora con duración de 6 minutos
                expiration = datetime.now() + timedelta(minutes=6)  # Cambiado a 6 minutos
                expiration_str = expiration.strftime('%Y-%m-%d %H:%M:%S')
                
                current_app.logger.info(f"Intentando guardar token para usuario {usuario['id']}")
                cursor.callproc(PASSWORD_PROCEDURES['STORE_TOKEN'], [
                    usuario['id'],
                    token,
                    expiration_str
                ])
                
                # Confirmar transacción
                if hasattr(cursor, '_connection'):
                    cursor._connection.commit()
                elif hasattr(cursor, 'connection'):
                    cursor.connection.commit()
                
                # 4. Crear URL para el frontend
                frontend_base_url = request.headers.get('Origin', 'http://localhost:5000')
                reset_url = f"{frontend_base_url}/reset-password/{token}"
                
                # 5. Preparar para enviar por correo (aunque en entorno de desarrollo lo mostraremos directamente)
                current_app.logger.info(f"URL de recuperación generada: {reset_url}")
                
                try:
                    # Intentar enviar correo (pero no fallar si no se puede)
                    msg = Message(
                        "Recuperación de Contraseña - Sistema de Salud",
                        recipients=[email],
                        html=render_template(
                            'emails/password_reset.html',
                            reset_url=reset_url,
                            nombre_usuario=usuario.get('nombre', 'Usuario'),
                            sistema_nombre=current_app.config.get('APP_NAME', 'Sistema de Salud'),
                            current_year=datetime.now().year
                        )
                    )
                    mail.send(msg)
                    current_app.logger.info(f"Email enviado a {email}")
                except Exception as email_error:
                    current_app.logger.warning(f"No se pudo enviar el correo: {str(email_error)}")
                    # Continuamos de todas formas, ya que mostraremos el enlace en la interfaz
                
                # 6. Devolver URL y token para que el frontend pueda mostrar directamente el enlace
                return success_response(
                    "Enlace de recuperación generado exitosamente", 
                    data={
                        "resetUrl": f"/reset-password/{token}",
                        "token": token,
                        "expiration": expiration_str,
                        "validUntil": expiration.isoformat()
                    }
                )
                
            except Exception as db_error:
                # Revertir transacción
                if hasattr(cursor, '_connection'):
                    cursor._connection.rollback()
                elif hasattr(cursor, 'connection'):
                    cursor.connection.rollback()
                current_app.logger.error(f"Error en DB: {str(db_error)}")
                raise db_error
                
    except Exception as e:
        current_app.logger.error(f"Error en solicitar_recuperacion: {str(e)}", exc_info=True)
        return error_response(f"Error al procesar la solicitud: {str(e)}", 500)




@recover_password.route('/resetear_password/<token>', methods=['POST'])
def resetear_password(token):
    try:
        data = request.get_json()
        
        # Validaciones básicas
        if not data or 'new_password' not in data:
            return error_response("La nueva contraseña es requerida", 400)
        
        new_password = data['new_password']
        
        # 1. Verificar fortaleza de la contraseña
        if len(new_password) < 8:
            return error_response("La contraseña debe tener al menos 8 caracteres", 400)
        
        # 2. Verificar el token
        serializer = Serializer(
            current_app.config['SECRET_KEY'],
            salt=current_app.config.get('SECURITY_PASSWORD_SALT', 'password-reset-salt')
        )
        
        try:
            # Token válido por 6 minutos (360 segundos)
            email = serializer.loads(token, max_age=360)
            current_app.logger.info(f"Token válido para email: {email}")
        except Exception as token_error:
            current_app.logger.warning(f"Token inválido: {str(token_error)}")
            return error_response("Token inválido o expirado", 400)
        
        # 3. Validar token contra la base de datos
        with get_db_cursor() as cursor:
            try:
                # Verificar token en la base de datos
                cursor.callproc(PASSWORD_PROCEDURES['VALIDATE_TOKEN'], [token])
                result = next(cursor.stored_results())
                token_data = fetch_one_dict_from_result(result)
                current_app.logger.info(f"Datos del token: {token_data}")

                if not token_data:
                    current_app.logger.warning("Token no encontrado en la BD")
                    return error_response("Token no encontrado", 400)
                    
                if token_data.get('usado') or token_data.get('expirado'):
                    current_app.logger.warning("Token ya usado o expirado")
                    return error_response("Token ya utilizado o expirado", 400)
                
                # 4. Actualizar la contraseña
                cursor.callproc(PASSWORD_PROCEDURES['UPDATE_PASSWORD'], [
                    token_data['id_usuario'],
                    new_password
                ])
                current_app.logger.info(f"Contraseña actualizada para usuario: {token_data['id_usuario']}")
                
                # 5. Invalidar el token (marcar como usado)
                cursor.callproc(PASSWORD_PROCEDURES['INVALIDATE_TOKEN'], [token])
                current_app.logger.info(f"Token invalidado: {token}")
                
                # Confirmar explícitamente la transacción
                if hasattr(cursor, '_connection'):  # Para mysql-connector-python
                    cursor._connection.commit()
                elif hasattr(cursor, 'connection'):  # Para PyMySQL
                    cursor.connection.commit()
                else:
                    current_app.logger.warning("No se pudo confirmar transacción - método no encontrado")
                
                return success_response("Contraseña actualizada exitosamente")
                
            except Exception as db_error:
                # Revertir en caso de error
                if hasattr(cursor, '_connection'):
                    cursor._connection.rollback()
                elif hasattr(cursor, 'connection'):
                    cursor.connection.rollback()
                current_app.logger.error(f"Error en DB: {str(db_error)}")
                raise db_error
                
    except Exception as e:
        current_app.logger.error(f"Error en resetear_password: {str(e)}", exc_info=True)
        return error_response(f"Error al restablecer contraseña: {str(e)}", 500)




@recover_password.route('/test-email', methods=['POST'])
def test_email():
    try:
        msg = Message(
            'Prueba de correo desde SolutionHost',
            recipients=['g.villacurat@gmail.com'],  
            body='Este es un mensaje de prueba desde tu aplicación Flask.'
        )
        mail.send(msg)
        return "Correo enviado correctamente!"
    except Exception as e:
        return f"Error al enviar correo: {str(e)}"