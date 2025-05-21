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

// Importar componentes
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { OnboardingFormNew } from "@/components/auth/onboarding-form-new";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PatientProfile } from "@/components/dashboard/PatientProfile";
import { RiskMonitoring } from "@/components/dashboard/RiskMonitoring";
import { ConditionManagement } from "@/components/dashboard/ConditionManagement";
import { ClinicalEducation } from "@/components/dashboard/ClinicalEducation";
import { PatientsList } from "@/components/dashboard/PatientsList";
import { PatientDetail } from "@/components/dashboard/PatientDetail";

// Componentes de página
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

  useEffect(() => {
    if (isAuthenticated && !isCheckingOnboardingStatus && !hasCompletedOnboarding) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, isCheckingOnboardingStatus, hasCompletedOnboarding, navigate]);

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

const AppRoutes = () => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;

  const renderPrivateRoute = (Component: React.ComponentType<any>, props?: any) => {
    if (isAuthenticated) {
      return <Component {...props} />;
    }
    return <LoginPage />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password/:token">
          {(params) => <ResetPasswordPage params={params} />}
        </Route>

        <Route path="/onboarding">
          {() => (
            <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
              <OnboardingFormNew />
            </div>
          )}
        </Route>

        <Route path="/">
          {() => renderPrivateRoute(DashboardPage)}
        </Route>

        <Route path="/dashboard">
          {() => renderPrivateRoute(DashboardPage)}
        </Route>

        <Route path="/settings/onboarding">
          {() => renderPrivateRoute(SettingsOnboardingPage)}
        </Route>

        <Route path="/settings">
          {() => renderPrivateRoute(() => (
            <DashboardLayout>
              <SettingsFormNew />
            </DashboardLayout>
          ))}
        </Route>

        <Route path="/condiciones">
          {() => renderPrivateRoute(ConditionsPage)}
        </Route>

        <Route path="/pacientes">
          {() => renderPrivateRoute(PatientsPage)}
        </Route>

        <Route path="/paciente/:id">
          {(params) => renderPrivateRoute(PatientDetailPage, {params})}
        </Route>

        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
};

const AppWithProviders = () => {
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(false);
  // Definir clientId como variable para evitar recreaciones innecesarias
  const clientId = "759420300435-1978tfdvh2ugducrmcd0crspn25u1a31.apps.googleusercontent.com";

  useEffect(() => {
    let isMounted = true;
    
    const checkAuthMethods = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/auth-methods", null);
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted && response.ok) {
          const data = await response.json();
          setGoogleAuthAvailable(data.success && data.data?.google_auth_available);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking auth methods:", error);
          setGoogleAuthAvailable(false);
        }
      }
    };
    
    checkAuthMethods();
    
    // Función de limpieza para evitar actualizaciones de estado en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, []);

  // Crear elementos separados para evitar recreaciones y problemas de memoria
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default function App() {
  return <AppWithProviders />;
}