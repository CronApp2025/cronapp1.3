import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SettingsFormNew } from "@/components/dashboard/settings/settings-form-new";
import SettingsOnboardingPage from "@/pages/SettingsOnboardingPage";
import { apiRequest } from "@/lib/queryClient";

// Components imports
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { OnboardingFormSimple } from "@/components/auth/onboarding-form-simple";
import { OnboardingFormNew } from "@/components/auth/onboarding-form-new";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PatientProfile } from "@/components/dashboard/PatientProfile";
import { RiskMonitoring } from "@/components/dashboard/RiskMonitoring";
import { ConditionManagement } from "@/components/dashboard/ConditionManagement";
import { ClinicalEducation } from "@/components/dashboard/ClinicalEducation";
import { PatientsList } from "@/components/dashboard/PatientsList";
import { PatientDetail } from "@/components/dashboard/PatientDetail";

// Route components
const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
    <div className="w-full max-w-md mx-auto">
      <LoginForm />
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
    <div className="w-full max-w-md mx-auto">
      <RegisterForm />
    </div>
  </div>
);

const ForgotPasswordPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
    <div className="w-full max-w-md mx-auto">
      <ForgotPasswordForm />
    </div>
  </div>
);

const ResetPasswordPage = ({ params }: { params: { token: string } }) => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
    <div className="w-full max-w-md mx-auto">
      <ResetPasswordForm token={params.token} />
    </div>
  </div>
);

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const { hasCompletedOnboarding, isCheckingOnboardingStatus } = useOnboarding();
  const [, navigate] = useLocation();

  // Si el usuario está autenticado pero no ha completado el onboarding, redirigirlo
  useEffect(() => {
    if (isAuthenticated && !isCheckingOnboardingStatus && !hasCompletedOnboarding) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, isCheckingOnboardingStatus, hasCompletedOnboarding, navigate]);

  // Mostramos una pantalla de carga mientras verificamos el estado
  if (isCheckingOnboardingStatus) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PatientProfile />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskMonitoring />
          <ClinicalEducation />
        </div>
      </div>
    </DashboardLayout>
  );
};

const ConditionsPage = () => (
  <DashboardLayout>
    <ConditionManagement />
  </DashboardLayout>
);

const PatientsPage = () => (
  <DashboardLayout>
    <PatientsList />
  </DashboardLayout>
);

const PatientDetailPage = ({ params }: { params: { id: string } }) => (
  <DashboardLayout>
    <PatientDetail id={params.id} />
  </DashboardLayout>
);



// Eliminamos AppContent para evitar redundancia y problemas

// Página independiente de reseteo de contraseña que se manejará fuera del contexto de autenticación
const StandaloneResetPasswordPage = ({ params }: { params: { token: string } }) => {
  const { token } = params;
  
  console.log("Renderizando página de reseteo standalone con token:", token);
  
  if (!token) {
    console.error("No se encontró token en la URL");
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Error</h2>
          <p className="text-center mb-4">El enlace de recuperación es inválido o ha expirado.</p>
          <div className="flex justify-center">
            <a 
              href="/login" 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-all"
            >
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-neutral">
      <div className="w-full max-w-md mx-auto">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};

export default function App() {
  // Estado para controlar si la autenticación de Google está disponible
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState<boolean>(false);
  const [isAuthMethodsLoaded, setIsAuthMethodsLoaded] = useState<boolean>(false);
  
  // Verificar métodos de autenticación disponibles
  useEffect(() => {
    const checkAuthMethods = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/auth-methods", null);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setGoogleAuthAvailable(!!data.data.google_auth_available);
          }
        }
      } catch (error) {
        console.error("Error al verificar métodos de autenticación:", error);
        setGoogleAuthAvailable(false);
      } finally {
        setIsAuthMethodsLoaded(true);
      }
    };
    
    checkAuthMethods();
  }, []);
  
  // Mostrar pantalla de carga mientras verificamos los métodos de autenticación
  if (!isAuthMethodsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Componente condicional para GoogleOAuthProvider
  const AppWithAuth = () => (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* Las rutas públicas */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password/:token">
          {(params) => <ResetPasswordPage params={params} />}
        </Route>
        
        {/* Ruta de onboarding para nuevos usuarios - Acceso directo sin verificación */}
        <Route path="/onboarding">
          {() => {
            return (
              <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
                <OnboardingFormNew />
              </div>
            );
          }}
        </Route>
        
        {/* Rutas que requieren autenticación */}
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        
        {/* Ruta para editar datos de onboarding */}
        <Route path="/settings/onboarding" component={SettingsOnboardingPage} />
        
        <Route path="/settings">
          {() => {
            const { isAuthenticated } = useAuth();
            if (!isAuthenticated) {
              return <LoginPage />;
            }
            return (
              <DashboardLayout>
                <SettingsFormNew />
              </DashboardLayout>
            );
          }}
        </Route>
        <Route path="/condiciones">
          {() => {
            const { isAuthenticated } = useAuth();
            if (!isAuthenticated) {
              return <LoginPage />;
            }
            return <ConditionsPage />;
          }}
        </Route>
        <Route path="/pacientes">
          {() => {
            console.log("Renderizando ruta /pacientes");
            // No verificamos autenticación temporalmente para pruebas
            // const { isAuthenticated } = useAuth();
            // if (!isAuthenticated) {
            //   return <LoginPage />;
            // }
            return <PatientsPage />;
          }}
        </Route>
        <Route path="/paciente/:id">
          {(params) => {
            console.log("Renderizando ruta /paciente/:id con params:", params);
            // No verificamos autenticación temporalmente para pruebas
            // const { isAuthenticated } = useAuth();
            // if (!isAuthenticated) {
            //   return <LoginPage />;
            // }
            return <PatientDetailPage params={params} />;
          }}
        </Route>

        
        {/* Ruta para manejar 404s */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );

  // Renderizar con o sin GoogleOAuthProvider según disponibilidad
  // Client ID hardcodeado temporalmente para desarrollo
  const GOOGLE_CLIENT_ID = "759420300435-1978tfdvh2ugducrmcd0crspn25u1a31.apps.googleusercontent.com";
  
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}