# database_utils.py
from contextlib import contextmanager

@contextmanager
def db_transaction(cursor):
    """Maneja una transacción de base de datos con commit/rollback automático"""
    try:
        yield cursor
        # Si no hubo excepciones, hacemos commit
        if hasattr(cursor, '_connection'):
            cursor._connection.commit()
        elif hasattr(cursor, 'connection'):
            cursor.connection.commit()
    except Exception as e:
        # Si hubo error, hacemos rollback
        if hasattr(cursor, '_connection'):
            cursor._connection.rollback()
        elif hasattr(cursor, 'connection'):
            cursor.connection.rollback()
        raise e  # Relanzamos la excepción