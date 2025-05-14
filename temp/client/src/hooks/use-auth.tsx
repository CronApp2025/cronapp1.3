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
  token: null,
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
    const token = localStorage.getItem("token");
    const refreshTokenStr = localStorage.getItem("refresh_token");
    const storedUserData = localStorage.getItem("user_data");

    if (token && refreshTokenStr && storedUserData) {
      const userData = JSON.parse(storedUserData);
      
      setState((prev) => ({ 
        ...prev,
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: true 
      }));

      validateToken(token)
        .then(validation => {
          if (!validation) {
            return refreshToken();
          }
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setState(prev => ({
            ...prev,
            isLoading: false
          }));
        });

      const refreshInterval = setInterval(refreshToken, 1000 * 60 * 10);
      return () => clearInterval(refreshInterval);
    } else {
      handleLogout();
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/validate", {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log("Validate token response:", data);
      if (!data.success || !data.data?.valid) {
        throw new Error('Token validation failed');
      }
      return data.data;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      const refreshTokenStr = localStorage.getItem("refresh_token");

      if (!refreshTokenStr) {
        throw new Error("No refresh token found");
      }

      // Validar token actual antes de refrescar
      if (currentToken) {
        const validation = await validateToken(currentToken);
        if (validation) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            user: validation.data,
            isAuthenticated: true
          }));
          return;
        }
      }

      const response = await apiRequest("POST", "/api/auth/refresh", {}, {
        headers: {
          'Authorization': `Bearer ${refreshTokenStr}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData;

        console.log("Token refreshed successfully");

        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        setState({
          user: {
            id: data.user_id,
            nombre: data.nombre || data.user_nombre || "",
            apellido: data.apellido || data.user_apellido || "",
            email: data.email || data.user_email || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
          },
          token: data.access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // If refresh token fails, log the user out
        handleLogout();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      handleLogout();
    }
  };

  const googleLoginMutation = useMutation({
    mutationFn: async (googleData: GoogleLoginData) => {
      console.log("Intentando inicio de sesión con Google:", googleData);
      const response = await apiRequest("POST", "/api/auth/google", googleData);
      const responseData = await response.json();
      console.log("Respuesta de login con Google:", responseData);
      // La API Flask devuelve un objeto con data, success y message
      return responseData.data || responseData;
    },
    onSuccess: (data) => {
      console.log("Login con Google exitoso, datos:", data);

      // Estructura de API Flask
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const userData = {
        id: data.id || data.user_id,
        nombre: data.nombre || data.user_nombre || "",
        apellido: data.apellido || data.user_apellido || "",
        email: data.email || data.user_email || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      };

      localStorage.setItem("user_data", JSON.stringify(userData));

      setState({
        user: userData,
        token: data.access_token,
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
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const responseData = await response.json();
      console.log("Respuesta de login:", responseData);
      // La API Flask devuelve un objeto con data, success y message
      return responseData.data || responseData;
    },
    onSuccess: (data) => {
      console.log("Login exitoso, datos:", data);

      // Estructura de API Flask
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const userData = {
        id: data.id || data.user_id,
        nombre: data.nombre || data.user_nombre || "",
        apellido: data.apellido || data.user_apellido || "",
        email: data.email || data.user_email || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      };

      localStorage.setItem("user_data", JSON.stringify(userData));

      setState({
        user: userData,
        token: data.access_token,
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
      const response = await apiRequest("POST", "/api/recover/solicitar_recuperacion", data);
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
      const response = await apiRequest("POST", `/api/recover/resetear_password/${token}`, data);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token"); // Remove refresh token on logout
    localStorage.removeItem("user_data"); // Remove user data on logout
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    queryClient.clear();
    navigate("/login");
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

    // Actualizar en localStorage
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
    
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