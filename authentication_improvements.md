# Sistema de Autenticación Persistente

## Características implementadas

El sistema de autenticación persistente implementado en CronApp 2.0 ofrece las siguientes características:

1. **Sesiones persistentes**: 
   - Los usuarios permanecen autenticados incluso después de cerrar el navegador o la pestaña.
   - Cada sesión tiene un identificador único (session_id) para control y revocación.

2. **Seguridad mejorada**:
   - Tokens JWT almacenados exclusivamente en cookies HTTP-only.
   - Protección CSRF integrada para todas las solicitudes que modifican datos.
   - Sin almacenamiento de tokens en localStorage/sessionStorage (previene XSS).

3. **Gestión de sesiones**:
   - Posibilidad de ver las sesiones activas de un usuario.
   - Opción para cerrar sesión en un dispositivo específico.
   - Opción para cerrar todas las sesiones activas.

4. **Renovación automática de tokens**:
   - Tokens de acceso de corta duración (por defecto 15 minutos).
   - Tokens de refresco de larga duración (por defecto 7 días).
   - Renovación automática transparente para el usuario.
   
5. **Revocación de tokens**:
   - Revocación inmediata de tokens al cerrar sesión.
   - Capacidad de revocar todas las sesiones de un usuario.

## Flujo de autenticación

1. **Inicio de sesión**:
   - El usuario ingresa credenciales.
   - El servidor valida las credenciales y genera:
     - Un token de acceso (corta duración)
     - Un token de refresco (larga duración)
     - Un identificador de sesión único
   - Los tokens se almacenan como cookies HTTP-only.
   - Se registra la sesión activa en el servidor.

2. **Solicitudes autenticadas**:
   - El navegador envía automáticamente las cookies con cada solicitud.
   - El servidor verifica el token de acceso y la validez de la sesión.
   - Si es válido, se procesa la solicitud.

3. **Renovación de tokens**:
   - Cuando el token de acceso expira, se usa el token de refresco para obtener uno nuevo.
   - El servidor verifica que la sesión siga activa.
   - Se mantiene el mismo identificador de sesión.

4. **Cierre de sesión**:
   - Se eliminan las cookies del navegador.
   - Se invalida la sesión en el servidor.
   - Cualquier intento de usar tokens asociados a esa sesión fallará.

## Implementación técnica

- Se utiliza Flask-JWT-Extended para la generación y validación de tokens JWT.
- Se implementó un `TokenManager` para la gestión de sesiones activas e invalidadas.
- Las cookies JWT tienen configurados los atributos de seguridad:
  - `HttpOnly`: Evita acceso desde JavaScript
  - `Secure` (en producción): Solo se envían por HTTPS
  - `SameSite=Strict`: Protección adicional contra CSRF

## Ventajas sobre la implementación anterior

1. Persistencia real: El token de refresco permite mantener la sesión activa durante días.
2. Mejor seguridad: No hay exposición de tokens en localStorage (vulnerable a XSS).
3. Mejor experiencia: El usuario no necesita iniciar sesión repetidamente.
4. Control granular: Capacidad de gestionar sesiones específicas.

## Ejemplos de uso

### Inicio de sesión
```javascript
// Frontend (ejemplo simplificado)
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',  // Importante para enviar/recibir cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  return await response.json();
};
```

### Validación de sesión
```javascript
// Frontend (ejemplo simplificado)
const validateSession = async () => {
  try {
    const response = await fetch('/api/auth/validate', {
      credentials: 'include',  // Importante para enviar cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
};
```

### Cierre de sesión
```javascript
// Frontend (ejemplo simplificado)
const logout = async (sessionId) => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  
  return await response.json();
};
```

## Pruebas

Se ha incluido un script de prueba `test_auth.sh` que verifica:
1. Login exitoso
2. Validación de token
3. Refresco de token
4. Logout y revocación de sesión

## Configuración

La duración de los tokens y otras opciones de seguridad se configuran en `api/config.py`.