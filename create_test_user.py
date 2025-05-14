#!/usr/bin/env python3
import sys
import mysql.connector
from werkzeug.security import generate_password_hash
import os
from datetime import datetime

# Obtener configuración de base de datos desde variables de entorno
db_config = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', ''),
    'database': os.environ.get('MYSQL_DATABASE', 'cronapp'),
    'port': int(os.environ.get('MYSQL_PORT', 3306))
}

# Datos del usuario de prueba
test_user = {
    'email': 'test@example.com',
    'password': 'Passw0rd!',
    'nombre': 'Usuario',
    'apellido': 'De Prueba',
    'fecha_nacimiento': '1990-01-01'
}

def main():
    try:
        # Conectar a la base de datos
        print(f"Conectando a la base de datos {db_config['database']} en {db_config['host']}...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si el usuario ya existe
        cursor.execute("SELECT id FROM users WHERE email = %s", (test_user['email'],))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"El usuario con email {test_user['email']} ya existe.")
            user_id = existing_user['id']
            
            # Actualizar contraseña
            hashed_password = generate_password_hash(test_user['password'])
            cursor.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (hashed_password, user_id)
            )
            conn.commit()
            print(f"Contraseña actualizada para el usuario ID {user_id}")
        else:
            # Crear nuevo usuario
            hashed_password = generate_password_hash(test_user['password'])
            cursor.execute("""
                INSERT INTO users (email, password, nombre, apellido, fecha_nacimiento, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                test_user['email'],
                hashed_password,
                test_user['nombre'],
                test_user['apellido'],
                test_user['fecha_nacimiento'],
                datetime.now(),
                datetime.now()
            ))
            conn.commit()
            user_id = cursor.lastrowid
            print(f"Usuario creado con ID {user_id}")
        
        print(f"Credenciales para pruebas:")
        print(f"Email: {test_user['email']}")
        print(f"Password: {test_user['password']}")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        sys.exit(1)
    except Exception as e:
        print(f"Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()