# Script para inspeccionar detalladamente los usuarios
from db import get_connection
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('user_inspector')

def inspect_users():
    logger.info("Inspeccionando tabla de usuarios...")
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Consultar todos los usuarios
        cursor.execute("SELECT id, nombre, apellido, email, password, fecha_nacimiento FROM users")
        users = cursor.fetchall()
        
        logger.info(f"Total de usuarios encontrados: {len(users)}")
        
        # Mostrar detalles de cada usuario (ocultando la contraseña completa)
        for user in users:
            password_sample = user['password'][:10] + '...' if user['password'] and len(user['password']) > 10 else user['password']
            logger.info(f"Usuario {user['id']}: {user['nombre']} {user['apellido']} ({user['email']})")
            logger.info(f"  - Fecha nacimiento: {user['fecha_nacimiento']}")
            logger.info(f"  - Password (muestra): {password_sample}")
            logger.info(f"  - Longitud password: {len(user['password']) if user['password'] else 0}")
            
            # Verificar formato de la contraseña
            if user['password']:
                if user['password'].startswith(('pbkdf2:', 'scrypt:', 'sha256:')):
                    logger.info(f"  - Formato password: Hash de Werkzeug")
                elif len(user['password']) > 50:
                    logger.info(f"  - Formato password: Posible hash")
                else:
                    logger.info(f"  - Formato password: Texto simple")
        
        cursor.close()
        conn.close()
        logger.info("Inspección de usuarios completada.")
        
    except Exception as e:
        logger.error(f"Error durante la inspección de usuarios: {str(e)}")

if __name__ == "__main__":
    inspect_users()