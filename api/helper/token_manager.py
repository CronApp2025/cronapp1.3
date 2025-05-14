from datetime import datetime, timedelta
from typing import Dict, Set, Tuple
import threading
import time
import uuid
from config import EXPIRE_TOKEN_TIME

class TokenManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                # Cambiar a un diccionario para almacenar token jti y su tiempo de expiración
                cls._instance.denylist: Dict[str, datetime] = {}
                # Almacenar refresh tokens con UUID por sesión
                cls._instance.refresh_tokens: Dict[str, Dict[str, Tuple[str, str]]] = {}
                cleanup_thread = threading.Thread(target=cls._instance._cleanup_expired_tokens, daemon=True)
                cleanup_thread.start()
            return cls._instance

    def add_to_denylist(self, jti: str, exp_time: datetime = None):
        """
        Añade un token a la denylist con tiempo de expiración
        - jti: ID único del token (JWT ID)
        - exp_time: Tiempo de expiración del token, si no se proporciona se usa el valor predeterminado
        """
        if jti:
            # Si no se proporciona tiempo de expiración, se usa el valor predeterminado
            if not exp_time:
                exp_time = datetime.now() + timedelta(minutes=EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"])
            
            with self._lock:
                self.denylist[jti] = exp_time
                print(f"Token {jti} añadido a denylist. Expira en: {exp_time}")

    def is_denied(self, jti: str | None) -> bool:
        """
        Verifica si un token está en la denylist y todavía no ha expirado
        """
        if not jti or not isinstance(jti, str):
            return False
        
        with self._lock:
            # Si el token no está en la denylist, no está denegado
            if jti not in self.denylist:
                return False
            
            # Si el token está en la denylist pero ha expirado, lo eliminamos
            if datetime.now() > self.denylist[jti]:
                self.denylist.pop(jti)
                return False
            
            # El token está en la denylist y aún no ha expirado
            return True

    def generate_session_id(self) -> str:
        """
        Genera un identificador único para la sesión
        """
        return str(uuid.uuid4())

    def store_refresh_token(self, user_id: str, refresh_token: str, session_id: str = None):
        """
        Almacena un token de refresco para un usuario con un ID de sesión único
        - user_id: ID del usuario
        - refresh_token: Token de refresco JWT
        - session_id: ID de sesión única (si no se proporciona, se genera uno)
        
        Returns: El ID de sesión asociado al token
        """
        if user_id and refresh_token:
            if not session_id:
                session_id = self.generate_session_id()
                
            with self._lock:
                # Inicializar diccionario para el usuario si no existe
                if user_id not in self.refresh_tokens:
                    self.refresh_tokens[user_id] = {}
                
                # Almacenar el token con su ID de sesión
                self.refresh_tokens[user_id][session_id] = (refresh_token, str(datetime.now()))
                print(f"Token de refresco almacenado para usuario {user_id}, sesión {session_id}")
                
            return session_id
        return None

    def validate_refresh_token(self, user_id: str, token: str, session_id: str) -> bool:
        """
        Valida un token de refresco para un usuario y sesión específicos
        """
        with self._lock:
            if user_id not in self.refresh_tokens:
                return False
                
            if session_id not in self.refresh_tokens[user_id]:
                return False
                
            stored_token, _ = self.refresh_tokens[user_id][session_id]
            return stored_token == token

    def invalidate_session(self, user_id: str, session_id: str):
        """
        Invalida una sesión específica para un usuario
        """
        with self._lock:
            if user_id in self.refresh_tokens and session_id in self.refresh_tokens[user_id]:
                self.refresh_tokens[user_id].pop(session_id)
                print(f"Sesión {session_id} invalidada para usuario {user_id}")

    def invalidate_all_sessions(self, user_id: str):
        """
        Invalida todas las sesiones de un usuario
        """
        with self._lock:
            if user_id in self.refresh_tokens:
                self.refresh_tokens.pop(user_id)
                print(f"Todas las sesiones invalidadas para usuario {user_id}")

    def _cleanup_expired_tokens(self):
        """
        Elimina tokens expirados de la denylist periódicamente
        """
        while True:
            time.sleep(60)  # Limpiar cada minuto
            with self._lock:
                current_time = datetime.now()
                expired_tokens = [jti for jti, exp_time in self.denylist.items() if current_time > exp_time]
                
                for jti in expired_tokens:
                    self.denylist.pop(jti)
                    
                if expired_tokens:
                    print(f"Limpieza: {len(expired_tokens)} tokens expirados eliminados de la denylist")

# Singleton instance
token_manager = TokenManager()