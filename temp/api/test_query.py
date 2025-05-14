# Script para verificar consultas a la base de datos MySQL
from db import get_connection
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('db_query_test')

def query_tables():
    logger.info("Consultando información de tablas en MySQL...")
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Consultar las tablas disponibles
        tables = ['users', 'conditions', 'metrics', 'alerts', 'educational_resources', 'password_reset_tokens']
        
        for table in tables:
            logger.info(f"Consultando tabla: {table}")
            try:
                # Contar registros
                cursor.execute(f"SELECT COUNT(*) AS count FROM {table}")
                count_result = cursor.fetchone()
                logger.info(f"  - Registros en {table}: {count_result['count']}")
                
                # Listar los primeros registros si hay datos
                if count_result['count'] > 0:
                    cursor.execute(f"SELECT * FROM {table} LIMIT 2")
                    rows = cursor.fetchall()
                    logger.info(f"  - Primeros {len(rows)} registros (muestra parcial):")
                    for row in rows:
                        # Mostrar solo algunos campos para evitar exceso de información
                        sample = {k: v for i, (k, v) in enumerate(row.items()) if i < 3}
                        logger.info(f"    {sample}...")
            except Exception as e:
                logger.error(f"  - Error consultando tabla {table}: {str(e)}")
                
        cursor.close()
        conn.close()
        logger.info("Consultas completadas.")
        
    except Exception as e:
        logger.error(f"Error durante las consultas: {str(e)}")

if __name__ == "__main__":
    query_tables()