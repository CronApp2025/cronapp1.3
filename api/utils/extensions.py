from flask import app, current_app
from flask_mail import Mail
from itsdangerous import Serializer, URLSafeTimedSerializer

mail = Mail()

# Configuración del serializador (debe coincidir con tu SECRET_KEY)
def get_password_serializer():
    return Serializer(app.config['SECRET_KEY'], salt='password-reset-salt')
