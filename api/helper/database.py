from contextlib import contextmanager
from flask import current_app
import sys
import os
import mysql.connector
from mysql.connector import Error

# Importar con la ruta absoluta para configuración
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import config

# Función auxiliar para obtener conexión MySQL
def get_connection():
    """
    Obtiene una conexión a la base de datos MySQL usando las credenciales 
    definidas en config.py
    """
    try:
        conn = mysql.connector.connect(
            host=config.DB_CONFIG['host'],
            user=config.DB_CONFIG['user'],
            password=config.DB_CONFIG['password'],
            database=config.DB_CONFIG['database'],
            port=config.DB_CONFIG['port']
        )
        return conn
    except Error as e:
        current_app.logger.error(f"Error de conexión a MySQL: {str(e)}")
        raise

@contextmanager
def get_db_connection():
    conn = None
    try:
        conn = get_connection() 
        yield conn
    except Exception as e:
        current_app.logger.error(f"Error de conexión a MySQL: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

@contextmanager
def get_db_cursor(dictionary=True):
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=dictionary)
        try:
            yield cursor
            conn.commit()  # Autocommit cada operación
        except:
            conn.rollback()  # Rollback en caso de error
            raise
        finally:
            cursor.close()

def fetch_one_dict_from_result(cursor):
    """
    MySQL con dictionary=True ya retorna resultados como diccionarios,
    pero mantenemos esta función para compatibilidad con el código existente.
    """
    row = cursor.fetchone()
    if row is None:
        return None
    return row  # Ya es un diccionario si se usó dictionary=True

def fetch_all_dict_from_result(cursor):
    """
    MySQL con dictionary=True ya retorna resultados como diccionarios,
    pero mantenemos esta función para compatibilidad con el código existente.
    """
    rows = cursor.fetchall()
    return rows  # Ya son diccionarios si se usó dictionary=True