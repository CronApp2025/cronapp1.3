import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthState, LoginCredentials, ForgotPasswordRequest, ResetPasswordRequest, GoogleLoginData } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (googleData: GoogleLoginData) => Promise<void>;
  logout: () => void;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<any>; // Devuelve el resultado para poder usarlo en el componente
  resetPassword: (token: string, data: ResetPasswordRequest) => Promise<void>;
  updateUserInfo: (userData: Partial<AuthState['user']>) => void; // Nuevo método para actualizar los datos del usuario
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Check if user is already logged in
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    // En lugar de localStorage, verificar la autenticación mediante una petición API
    // Los tokens se manejan automáticamente por el navegador a través de cookies HttpOnly
    const checkAuth = async () => {
      try {
        if (!isMounted) return;
        
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          navigate("/login");
        } else {
          // El estado ya se actualiza en checkAuthStatus
          if (isMounted) {
            refreshInterval = setInterval(() => {
              // Usado para refrescar la cookie de sesión
              if (isMounted) {
                checkAuthStatus();
              }
            }, 1000 * 60 * 10); // Cada 10 minutos
          }
        }
      } catch (error) {
        if (isMounted) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          navigate("/login");
        }
      }
    };
    
    checkAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [navigate]);
  
  // Nueva función para verificar estado de autenticación mediante API
  const checkAuthStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Los tokens se manejan mediante cookies HttpOnly
      const response = await apiRequest("GET", "/api/auth/validate", null, {
        credentials: 'include' // Para enviar cookies
      });
      
      if (!response.ok) {
        throw new Error('No autenticado');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Autenticación fallida');
      }
      
      // Si la autenticación es exitosa, actualizamos el estado con los datos del usuario
      const userData = data.data.user || {};
      
      setState({
        user: userData,
        isAuthenticated: true,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    }
  };

  // Ya no necesitamos la función validateToken explícita, 
  // pues checkAuthStatus ya maneja la validación mediante cookies

  // El refreshToken ya no es necesario como función separada ya que los tokens
  // son manejados como cookies HttpOnly por el servidor. 
  // La función checkAuthStatus ya se encarga de verificar la autenticación del usuario.

  const googleLoginMutation = useMutation({
    mutationFn: async (googleData: GoogleLoginData) => {
      console.log("Intentando inicio de sesión con Google:", googleData);
      const response = await apiRequest("POST", "/api/auth/google", googleData, {
        credentials: 'include' // Para enviar/recibir cookies
      });
      const responseData = await response.json();
      console.log("Respuesta de login con Google:", responseData);
      // La API Flask devuelve un objeto con data, success y message
      return responseData.data || responseData;
    },
    onSuccess: (data) => {
      console.log("Login con Google exitoso, datos:", data);

      // Los tokens ahora son gestionados por el servidor mediante cookies HttpOnly
      // No almacenamos ninguna información sensible en localStorage

      const userData = {
        id: data.id || data.user_id,
        nombre: data.nombre || data.user_nombre || "",
        apellido: data.apellido || data.user_apellido || "",
        email: data.email || data.user_email || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      };

      setState({
        user: userData,
        isAuthenticated: true,
        isLoading: true,
      });

      const isNewUser = data.is_new_user;

      toast({
        title: isNewUser ? "Cuenta creada exitosamente" : "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.nombre || data.user_nombre || "Usuario"}!`,
      });

      // Agregar un retraso y navegar mientras mantenemos isLoading en true
      setTimeout(() => {
        navigate("/dashboard");
        // Esperar un momento después de la navegación para desactivar la carga
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLoading: false
          }));
        }, 2000);
      }, 3000);
    },
    onError: (error: Error) => {
      console.error("Error en login con Google:", error);
      toast({
        title: "Error de inicio de sesión con Google",
        description: error.message || "No se pudo iniciar sesión con Google",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log("Intentando inicio de sesión con:", credentials);
      const response = await apiRequest("POST", "/api/auth/login", credentials, {
        credentials: 'include' // Para enviar/recibir cookies
      });
      const responseData = await response.json();
      console.log("Respuesta de login:", responseData);
      // La API Flask devuelve un objeto con data, success y message
      return responseData.data || responseData;
    },
    onSuccess: (data) => {
      console.log("Login exitoso, datos:", data);

      // Los tokens ahora son gestionados por el servidor mediante cookies HttpOnly
      // No almacenamos ninguna información sensible en localStorage

      const userData = {
        id: data.id || data.user_id,
        nombre: data.nombre || data.user_nombre || "",
        apellido: data.apellido || data.user_apellido || "",
        email: data.email || data.user_email || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      };

      setState({
        user: userData,
        isAuthenticated: true,
        isLoading: true,
      });

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.nombre || data.user_nombre || "Usuario"}!`,
      });

      // Agregar un retraso y navegar mientras mantenemos isLoading en true
      setTimeout(() => {
        navigate("/dashboard");
        // Esperar un momento después de la navegación para desactivar la carga
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLoading: false
          }));
        }, 2000);
      }, 3000);
    },
    onError: (error: Error) => {
      console.error("Error en login:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Por favor, verifica tus credenciales",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      // Usamos exclusivamente la ruta de Flask (solicitar_recuperacion)
      const response = await apiRequest("POST", "/api/recover/solicitar_recuperacion", data, {
        credentials: 'include' // Para enviar/recibir cookies
      });
      const result = await response.json();
      console.log("Respuesta de la API Flask:", result);

      // Devolvemos la respuesta tal como viene de la API
      return result;
    },
    onSuccess: (data) => {
      if (!data.data || !data.data.resetUrl) {
        toast({
          title: "Solicitud enviada",
          description: "Revisa tu correo para instrucciones de recuperación",
        });
      }
      // No navegamos automáticamente, dejamos que el componente maneje la UI
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, data }: { token: string; data: ResetPasswordRequest }) => {
      // Usamos exclusivamente la ruta de Flask
      const response = await apiRequest("POST", `/api/recover/resetear_password/${token}`, data, {
        credentials: 'include' // Para enviar/recibir cookies
      });
      const result = await response.json();
      console.log("Respuesta de la API Flask (reset):", result);

      // Adaptamos el formato para que coincida con lo esperado por el resto de la aplicación
      const adaptedResult = {
        success: result.status === "success",
        message: result.message || "Contraseña actualizada exitosamente",
        data: { updated: result.status === "success" }
      };

      return adaptedResult;
    },
    onSuccess: (result) => {
      console.log("Respuesta de restablecimiento de contraseña:", result);

      // Mostrar mensaje de éxito
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente",
      });
      
      // Dejamos que el componente maneje la navegación
      // para evitar redirecciones automáticas que puedan interrumpir
      // la experiencia del usuario
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña. Verifica que el enlace sea válido y no haya expirado.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const handleLoginWithGoogle = async (googleData: GoogleLoginData) => {
    await googleLoginMutation.mutateAsync(googleData);
  };

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout para invalidar las cookies en el servidor
      await apiRequest("POST", "/api/auth/logout", {}, {
        credentials: 'include'
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Actualizar el estado local
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      queryClient.clear();
      
      // Usar setTimeout para evitar problemas de actualización de estado durante renderizado
      setTimeout(() => {
        navigate("/login");
      }, 0);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    return await forgotPasswordMutation.mutateAsync(data);
  };

  const handleResetPassword = async (token: string, data: ResetPasswordRequest) => {
    await resetPasswordMutation.mutateAsync({ token, data });
  };

  // Nueva función para actualizar los datos del usuario
  const handleUpdateUserInfo = (userData: Partial<AuthState['user']>) => {
    if (!state.user) return;

    // Combinar los datos actuales con los nuevos
    const updatedUser = {
      ...state.user,
      ...userData
    };

    // Actualizar el estado
    setState(prev => ({
      ...prev,
      user: updatedUser
    }));

    // Ya no almacenamos datos de usuario en localStorage
    // Solo actualizamos en memoria y en el estado
    console.log("Datos de usuario actualizados:", updatedUser);
    
    // Invalidar cualquier consulta relacionada con el usuario
    queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
  };

  const value = {
    ...state,
    login: handleLogin,
    loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    updateUserInfo: handleUpdateUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}