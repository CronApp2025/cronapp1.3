from datetime import datetime, timedelta
from typing import Dict, Set, Tuple, List, Optional, Any, Union
import threading
import time
import uuid
import logging
from config import EXPIRE_TOKEN_TIME

# Configurar logging específico para el gestor de tokens
logger = logging.getLogger("token_manager")
logger.setLevel(logging.INFO)

class TokenManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                # Diccionario para almacenar session_id invalidados y su tiempo de expiración
                cls._instance.denylist = {}
                # Almacenar sesiones activas por usuario
                cls._instance.active_sessions = {}
                # Registro de actividad para auditoría de seguridad
                cls._instance.activity_log = []
                # Iniciar hilo de limpieza
                cleanup_thread = threading.Thread(target=cls._instance._cleanup_expired_tokens, daemon=True)
                cleanup_thread.start()
            return cls._instance

    def _log_activity(self, action: str, user_id: Optional[str], session_id: Optional[str], details: Optional[Dict] = None):
        """
        Registra actividad para fines de auditoría
        """
        entry = {
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'user_id': user_id,
            'session_id': session_id,
            'details': details or {}
        }
        
        self.activity_log.append(entry)
        # Mantener log limitado a 1000 eventos
        if len(self.activity_log) > 1000:
            self.activity_log.pop(0)
            
        logger.info(f"TokenManager: {action} - User: {user_id} - Session: {session_id}")

    def add_to_denylist(self, session_id: str, exp_time: datetime = None, user_id: str = None):
        """
        Añade un session_id a la denylist para invalidarlo inmediatamente
        
        Args:
            session_id: ID de sesión a invalidar
            exp_time: Tiempo de expiración (opcional)
            user_id: ID del usuario (para registro)
            
        Returns:
            Boolean indicando éxito
        """
        if not session_id:
            return False
            
        # Si no se proporciona tiempo de expiración, usar el máximo posible
        if not exp_time:
            # Usar el mayor tiempo entre access_token y refresh_token
            days = EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"]
            minutes = EXPIRE_TOKEN_TIME["ACCESS_TOKEN_MINUTES"]
            
            if days * 24 * 60 > minutes:
                exp_time = datetime.now() + timedelta(days=days)
            else:
                exp_time = datetime.now() + timedelta(minutes=minutes)
        
        with self._lock:
            # Añadir a denylist
            self.denylist[session_id] = exp_time
            
            # Eliminar de sesiones activas si existe
            if user_id:
                if user_id in self.active_sessions and session_id in self.active_sessions[user_id]:
                    del self.active_sessions[user_id][session_id]
                    
                    # Si no quedan sesiones activas, eliminar entrada del usuario
                    if not self.active_sessions[user_id]:
                        del self.active_sessions[user_id]
            
            # Registrar actividad
            self._log_activity("session_invalidated", user_id, session_id, {
                "expires_at": exp_time.isoformat(),
                "reason": "explicit_invalidation"
            })
            
            logger.info(f"Session {session_id} added to denylist, expires at {exp_time}")
            return True

    def is_denied(self, session_id: str) -> bool:
        """
        Verifica si un session_id está en la denylist
        
        Args:
            session_id: ID de sesión a verificar
            
        Returns:
            True si la sesión está denegada, False si es válida
        """
        if not session_id:
            return False
        
        with self._lock:
            # Si no está en la denylist, es válido
            if session_id not in self.denylist:
                return False
            
            # Si expiró en la denylist, eliminar y considerar válido
            if datetime.now() > self.denylist[session_id]:
                self.denylist.pop(session_id)
                return False
            
            # En denylist y no expirado = invalidado
            return True

    def generate_session_id(self) -> str:
        """
        Genera un UUID v4 único para identificar sesiones
        """
        return str(uuid.uuid4())

    def register_session(self, user_id: str, session_id: str = None) -> str:
        """
        Registra una nueva sesión activa para un usuario
        
        Args:
            user_id: ID del usuario
            session_id: ID de sesión opcional (si no se proporciona, se genera)
            
        Returns:
            ID de sesión generado o proporcionado
        """
        if not user_id:
            raise ValueError("Se requiere user_id para registrar una sesión")
            
        if not session_id:
            session_id = self.generate_session_id()
            
        # Calcular expiración (usar tiempo de refresh token)
        expires_at = datetime.now() + timedelta(days=EXPIRE_TOKEN_TIME["REFRESH_TOKEN_DAYS"])
            
        with self._lock:
            # Verificar que no esté en denylist
            if session_id in self.denylist:
                # Generar nuevo si hay colisión
                session_id = self.generate_session_id()
            
            # Inicializar para el usuario si no existe
            if user_id not in self.active_sessions:
                self.active_sessions[user_id] = {}
                
            # Registrar sesión activa
            self.active_sessions[user_id][session_id] = expires_at
            
            # Log
            self._log_activity("session_created", user_id, session_id, {
                "expires_at": expires_at.isoformat()
            })
                
        return session_id

    def validate_session(self, user_id: str, session_id: str) -> bool:
        """
        Valida que un session_id pertenezca a un usuario y no esté invalidado
        
        Args:
            user_id: ID del usuario
            session_id: ID de sesión
            
        Returns:
            True si la sesión es válida, False si no
        """
        if not user_id or not session_id:
            return False
            
        # Verificar denylist primero (más rápido)
        if self.is_denied(session_id):
            logger.info(f"Session validation failed: {session_id} is in denylist")
            return False
            
        # Verificar sesión activa
        with self._lock:
            if user_id not in self.active_sessions:
                logger.info(f"Session validation failed: No active sessions for user {user_id}")
                return False
                
            if session_id not in self.active_sessions[user_id]:
                logger.info(f"Session validation failed: Session {session_id} not registered for user {user_id}")
                return False
                
            # Verificar expiración
            if datetime.now() > self.active_sessions[user_id][session_id]:
                # Eliminar sesión expirada
                del self.active_sessions[user_id][session_id]
                
                # Limpiar si no quedan sesiones
                if not self.active_sessions[user_id]:
                    del self.active_sessions[user_id]
                    
                logger.info(f"Session validation failed: Session {session_id} expired")
                return False
                
            # Todo correcto
            return True

    def revoke_session(self, user_id: str, session_id: str) -> bool:
        """
        Revoca una sesión específica de un usuario
        
        Args:
            user_id: ID del usuario
            session_id: ID de sesión a revocar
            
        Returns:
            True si se revocó, False si no
        """
        # Añadir a denylist y eliminar de sesiones activas
        success = self.add_to_denylist(session_id, user_id=user_id)
        
        if success:
            logger.info(f"Session {session_id} revoked for user {user_id}")
        
        return success

    def revoke_all_sessions(self, user_id: str) -> int:
        """
        Revoca todas las sesiones de un usuario
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Número de sesiones revocadas
        """
        if not user_id:
            return 0
            
        revoked_count = 0
        
        with self._lock:
            if user_id in self.active_sessions:
                # Añadir todas a denylist
                for session_id in list(self.active_sessions[user_id].keys()):
                    self.add_to_denylist(session_id, user_id=user_id)
                    revoked_count += 1
                
                # Eliminar todas
                del self.active_sessions[user_id]
                
                logger.info(f"All {revoked_count} sessions revoked for user {user_id}")
                
        return revoked_count

    def get_active_sessions(self, user_id: str) -> List[Dict]:
        """
        Obtiene sesiones activas de un usuario
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Lista de sesiones activas con metadatos
        """
        result = []
        
        with self._lock:
            if user_id in self.active_sessions:
                now = datetime.now()
                
                for session_id, expires_at in self.active_sessions[user_id].items():
                    if now <= expires_at:
                        result.append({
                            "session_id": session_id,
                            "expires_at": expires_at.isoformat(),
                            "remaining_minutes": (expires_at - now).total_seconds() // 60
                        })
                        
        return result

    def _cleanup_expired_tokens(self):
        """
        Limpia tokens y sesiones expiradas periódicamente
        """
        while True:
            try:
                now = datetime.now()
                expired_tokens = []
                expired_sessions = {}
                
                with self._lock:
                    # Limpiar denylist
                    for session_id, exp_time in self.denylist.items():
                        if now > exp_time:
                            expired_tokens.append(session_id)
                    
                    for session_id in expired_tokens:
                        self.denylist.pop(session_id)
                    
                    # Limpiar sesiones expiradas
                    for user_id in list(self.active_sessions.keys()):
                        if user_id not in expired_sessions:
                            expired_sessions[user_id] = []
                            
                        for session_id, exp_time in self.active_sessions[user_id].items():
                            if now > exp_time:
                                expired_sessions[user_id].append(session_id)
                    
                    # Eliminar sesiones expiradas
                    for user_id, sessions in expired_sessions.items():
                        for session_id in sessions:
                            if user_id in self.active_sessions and session_id in self.active_sessions[user_id]:
                                del self.active_sessions[user_id][session_id]
                        
                        # Limpiar usuario si no tiene sesiones
                        if user_id in self.active_sessions and not self.active_sessions[user_id]:
                            del self.active_sessions[user_id]
                    
                    # Log si hubo limpiezas
                    if expired_tokens or any(expired_sessions.values()):
                        logger.info(f"Cleanup: {len(expired_tokens)} denylist tokens, {sum(len(s) for s in expired_sessions.values())} expired sessions")
                
            except Exception as e:
                logger.error(f"Error during token cleanup: {str(e)}")
            
            # Limpiar cada minuto
            time.sleep(60)

# Singleton instance
token_manager = TokenManager()