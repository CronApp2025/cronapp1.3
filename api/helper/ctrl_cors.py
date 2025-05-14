from flask import Flask
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)

# Configuración detallada de CORS
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"],  # Dominios permitidos
            "methods": ["GET", "POST", "PUT", "DELETE"],  # Métodos permitidos
            "allow_headers": ["Content-Type", "Authorization"],  # Headers permitidos
            "supports_credentials": True  # Para cookies/tokens de autenticación
        }
    }
)
