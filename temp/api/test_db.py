# Script de prueba para verificar conexión a MySQL desde la API Flask
from db import test_db_connection
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('db_test')

def main():
    logger.info("Iniciando prueba de conexión a la base de datos MySQL...")
    try:
        result = test_db_connection()
        if result:
            logger.info("Conexión a MySQL exitosa desde la API Flask")
        else:
            logger.error("No se pudo conectar a MySQL desde la API Flask")
    except Exception as e:
        logger.error(f"Error durante la prueba de conexión: {str(e)}")

if __name__ == "__main__":
    main()