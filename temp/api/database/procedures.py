#USUARIO
USER_PROCEDURES = {
    "AGREGAR": "agregar_usuario",
    "EDITAR": "editar_usuario",
    "ELIMINAR": "eliminar_usuario",
    "BUSCAR_POR_ID": "buscar_usuario_por_id",
    "OBTENER_TODOS": "obtener_todos_usuarios",
}

AUTH = {
    "LOGIN":"login"
}


PASSWORD_PROCEDURES = {
    'REQUEST_RESET': 'sp_solicitar_recuperacion',
    'STORE_TOKEN': 'sp_guardar_token_recuperacion',
    'VALIDATE_TOKEN': 'sp_validar_token_recuperacion',
    'UPDATE_PASSWORD': 'sp_actualizar_password',
    'INVALIDATE_TOKEN': 'sp_invalidar_token'
}