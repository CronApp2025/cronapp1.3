from itsdangerous import URLSafeTimedSerializer as Serializer
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import os
from flask import Blueprint, current_app, request, render_template
from flask_mail import Message
from helper.database import fetch_one_dict_from_result, get_db_connection
from helper.response_utils import success_response, error_response

recover_password = Blueprint('recover', __name__)

from helper.Middleware.rate_limiter import rate_limit

@recover_password.route('/solicitar_recuperacion', methods=['POST'])
@rate_limit(max_requests=3, per_seconds=60, by_route=True)  # Límite estricto para prevenir spam de solicitudes
def solicitar_recuperacion():
    try:
        data = request.get_json()
        email = data['email']
        
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                # 1. Verificar si el email existe
                query = "SELECT id, nombre, apellido, email FROM users WHERE email = %s"
                cursor.execute(query, (email,))
                usuario = fetch_one_dict_from_result(cursor)
                
                if not usuario:
                    return error_response("El email no está registrado", 404)
                
                # 2. Generar token
                serializer = Serializer(
                    secret_key=current_app.config['SECRET_KEY'],
                    salt=current_app.config['SECURITY_PASSWORD_SALT']
                )
                token = serializer.dumps(email)
                current_app.logger.info(f"Token generado para {email}: {token}")
                
                # 3. Guardar token - duración de 6 minutos
                expiration = datetime.now() + timedelta(minutes=6)
                
                # Guardar token en la base de datos
                insert_query = """
                INSERT INTO password_reset_tokens 
                (user_id, token, expires_at, created_at) 
                VALUES (%s, %s, %s, NOW())
                """
                cursor.execute(insert_query, (usuario['id'], token, expiration))
                
                # Confirmar transacción
                conn.commit()
                
                # 4. Crear URL para el frontend
                # Determinar la URL base más confiable
                frontend_base_url = request.headers.get('Origin')
                
                # Si no hay encabezado Origin, intentar con el Host o usar un dominio configurado
                if not frontend_base_url or "localhost" in frontend_base_url or "127.0.0.1" in frontend_base_url:
                    host = request.headers.get('Host')
                    
                    # Si el host es localhost o similar, usar el dominio de Replit
                    if not host or "localhost" in host or "127.0.0.1" in host:
                        # Intentar obtener el dominio desde variables de entorno Replit
                        replit_domain = os.environ.get('REPL_SLUG', None)
                        replit_owner = os.environ.get('REPL_OWNER', None)
                        
                        if replit_domain and replit_owner:
                            frontend_base_url = f"https://{replit_domain}.{replit_owner}.repl.co"
                        else:
                            # Si no hay información de Replit, usar una URL configurada o una predeterminada
                            frontend_base_url = os.environ.get('FRONTEND_URL', 'https://cronapp-healthtech.replit.app')
                    else:
                        # Si el host no es localhost, usarlo (probablemente URL real)
                        protocol = "https"  # En producción, siempre usar HTTPS
                        frontend_base_url = f"{protocol}://{host}"
                
                # Si todo falla, usar un valor predeterminado seguro
                if not frontend_base_url or frontend_base_url == 'null' or "localhost" in frontend_base_url:
                    # Obtener la URL del dominio actual de Replit
                    try:
                        import subprocess
                        replit_url = subprocess.check_output("echo $REPL_SLUG.$REPL_OWNER.repl.co", shell=True).decode().strip()
                        if replit_url and "." in replit_url:
                            frontend_base_url = f"https://{replit_url}"
                        else:
                            # Último recurso: usar una URL codificada
                            frontend_base_url = 'https://cronapp-healthtech.replit.app'
                    except:
                        frontend_base_url = 'https://cronapp-healthtech.replit.app'
                    
                # Asegurarse de que no haya barra final en la URL base
                if frontend_base_url.endswith('/'):
                    frontend_base_url = frontend_base_url[:-1]
                    
                reset_url = f"{frontend_base_url}/reset-password/{token}"
                
                # Registrar la URL para debug
                current_app.logger.info(f"URL de recuperación base: {frontend_base_url}")
                
                # 5. Registrar información del enlace generado
                current_app.logger.info(f"URL de recuperación generada: {reset_url}")
                
                try:
                    # Intentar enviar el correo electrónico
                    from flask_mail import Message
                    msg = Message(
                        subject="Restablecimiento de contraseña - CRONAPP",
                        recipients=[email],
                        body=f"""
Hola,

Has solicitado restablecer tu contraseña en CRONAPP. Por favor, haz clic en el siguiente enlace para continuar:

{reset_url}

Este enlace expirará en 6 minutos.

Si no has solicitado este cambio, por favor ignora este correo.

Saludos,
Equipo CRONAPP
                        """,
                        html=f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h2 style="color: #4A5568;">Restablecimiento de Contraseña</h2>
                            </div>
                            
                            <p style="font-size: 16px; color: #4A5568;">Hola,</p>
                            
                            <p style="font-size: 16px; color: #4A5568;">Has solicitado restablecer tu contraseña en CRONAPP. Para completar el proceso, haz clic en el siguiente botón:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{reset_url}" style="background-color: #4A5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
                            </div>
                            
                            <p style="font-size: 14px; color: #718096;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                            <p style="font-size: 14px; color: #4A5568; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">{reset_url}</p>
                            
                            <p style="font-size: 14px; color: #718096; margin-top: 20px;"><strong>IMPORTANTE:</strong> Este enlace expirará en 6 minutos.</p>
                            
                            <p style="font-size: 14px; color: #718096;">Si no has solicitado este cambio, puedes ignorar este correo con seguridad.</p>
                            
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p style="font-size: 14px; color: #718096; text-align: center;">Saludos,<br><strong>Equipo CRONAPP</strong></p>
                            </div>
                        </div>
                        """
                    )
                    
                    # Obtener la extensión de correo
                    mail = current_app.extensions.get('mail')
                    if mail:
                        mail.send(msg)
                        current_app.logger.info(f"Correo de recuperación enviado a: {email}")
                    else:
                        current_app.logger.warning("Flask-Mail no está configurado correctamente.")
                        
                except Exception as email_error:
                    current_app.logger.warning(f"No se pudo enviar el correo: {str(email_error)}")
                
                # 6. Devolver URL y token para que el frontend pueda mostrar directamente el enlace
                return success_response(
                    data={
                        "resetUrl": f"/reset-password/{token}",
                        "token": token,
                        "expiration": expiration.strftime('%Y-%m-%d %H:%M:%S'),
                        "validUntil": expiration.isoformat()
                    },
                    msg="Enlace de recuperación generado exitosamente"
                )
                
            except Exception as db_error:
                # Revertir transacción en caso de error
                conn.rollback()
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
        
        # 1. Verificar fortaleza de la contraseña (requisitos estrictos)
        if len(new_password) < 12:
            return error_response("La contraseña debe tener al menos 12 caracteres", 400)
        
        # Validar complejidad de contraseña
        has_upper = any(c.isupper() for c in new_password)
        has_lower = any(c.islower() for c in new_password)
        has_digit = any(c.isdigit() for c in new_password)
        has_special = any(not c.isalnum() for c in new_password)
        
        if not (has_upper and has_lower and has_digit and has_special):
            return error_response("La contraseña debe incluir mayúsculas, minúsculas, números y símbolos", 400)
        
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
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                # Verificar token en la base de datos
                query = """
                SELECT t.id, t.user_id, t.used_at, t.expires_at < NOW() as expired, u.email
                FROM password_reset_tokens t
                JOIN users u ON t.user_id = u.id
                WHERE t.token = %s
                """
                cursor.execute(query, (token,))
                token_data = fetch_one_dict_from_result(cursor)
                current_app.logger.info(f"Datos del token: {token_data}")

                if not token_data:
                    current_app.logger.warning("Token no encontrado en la BD")
                    return error_response("Token no encontrado", 400)
                    
                if token_data.get('used_at') or token_data.get('expired'):
                    current_app.logger.warning("Token ya usado o expirado")
                    return error_response("Token ya utilizado o expirado", 400)
                
                # Verificar que el email del token coincida con el email en la base de datos
                if email != token_data.get('email'):
                    current_app.logger.warning(f"El email del token ({email}) no coincide con el email en la base de datos ({token_data.get('email')})")
                    return error_response("Token inválido", 400)
                
                # 4. Actualizar la contraseña
                hashed_password = generate_password_hash(new_password)
                update_query = "UPDATE users SET password = %s, updated_at = NOW() WHERE id = %s"
                cursor.execute(update_query, (hashed_password, token_data['user_id']))
                current_app.logger.info(f"Contraseña actualizada para usuario: {token_data['user_id']}")
                
                # 5. Invalidar el token (marcar como usado)
                invalidate_query = "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = %s"
                cursor.execute(invalidate_query, (token_data['id'],))
                current_app.logger.info(f"Token invalidado: {token}")
                
                # Confirmar transacción
                conn.commit()
                
                return success_response("Contraseña actualizada exitosamente")
                
            except Exception as db_error:
                # Revertir en caso de error
                conn.rollback()
                current_app.logger.error(f"Error en DB: {str(db_error)}")
                raise db_error
                
    except Exception as e:
        current_app.logger.error(f"Error en resetear_password: {str(e)}", exc_info=True)
        return error_response(f"Error al restablecer contraseña: {str(e)}", 500)

@recover_password.route('/test-email', methods=['GET'])
def test_email():
    try:
        # Obtener el email del parámetro en la URL o usar uno por defecto
        email_destinatario = request.args.get('email', 'rddev2278@gmail.com')
        
        from flask_mail import Message
        msg = Message(
            subject="Prueba de correo - CRONAPP",
            recipients=[email_destinatario],
            body=f"""
            Hola,
            
            Este es un correo de prueba desde la API de CRONAPP.
            
            Si estás viendo este mensaje, significa que la configuración de correo está 
            funcionando correctamente en el entorno de producción.
            
            Saludos,
            Equipo CRONAPP
            """,
            html=f"""
            <h2>Prueba de correo - CRONAPP</h2>
            <p>Hola,</p>
            <p>Este es un correo de prueba desde la API de CRONAPP.</p>
            <p>Si estás viendo este mensaje, significa que la configuración de correo está 
            funcionando correctamente en el entorno de producción.</p>
            <p>Saludos,<br>
            Equipo CRONAPP</p>
            """
        )
        
        mail = current_app.extensions.get('mail')
        if mail:
            mail.send(msg)
            return success_response(f"Correo de prueba enviado correctamente a {email_destinatario}. Verifica tu bandeja de entrada o en Mailtrap.")
        else:
            return error_response("Flask-Mail no está configurado correctamente")
    except ImportError:
        return error_response("Flask-Mail no está instalado")
    except Exception as e:
        current_app.logger.error(f"Error en test_email: {str(e)}", exc_info=True)
        return error_response(f"Error al enviar el correo de prueba: {str(e)}", 500)