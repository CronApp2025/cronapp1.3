# db.py
import os
import mysql.connector
from mysql.connector import Error
from mysql.connector.cursor import MySQLCursorDict
from config import DB_CONFIG, DATABASE_URL

def get_connection():
    """
    Obtiene una conexión a la base de datos MySQL usando las credenciales 
    definidas en las variables de entorno o en config.py
    """
    try:
        # Si no hay URL, usar los parámetros individuales
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            port=DB_CONFIG['port']
        )
        print("Conexión establecida con éxito a MySQL usando parámetros individuales")
        return conn
    except Error as e:
        print(f"Error de conexión a la base de datos MySQL: {str(e)}")
        print(f"DB_CONFIG: {DB_CONFIG}")
        raise

# Prueba de conexión
def test_db_connection():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT 1 AS test")
        result = cursor.fetchone()
        print(f"Prueba de conexión exitosa a MySQL: {result}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error al probar la conexión a MySQL: {str(e)}")
        return False