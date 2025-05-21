import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { apiRequest } from "@/lib/queryClient";
import { LoadingScreen } from "@/components/ui/loading-screen";
import NotFound from "@/pages/not-found";
import { SettingsFormNew } from "@/components/dashboard/settings/settings-form-new";
import SettingsOnboardingPage from "@/pages/SettingsOnboardingPage";

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



// Definir componentes de página básicos
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

// Componente de Onboarding
const OnboardingPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
    <OnboardingFormNew />
  </div>
);

// Dashboard
const DashboardPage = () => (
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

// Otras páginas
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

const SettingsPage = () => (
  <DashboardLayout>
    <SettingsFormNew />
  </DashboardLayout>
);

// Componente que protege las rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <LoginPage />;
};

// Componente de rutas
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-background">
      <AuthProvider>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password/:token">
            {(params) => <ResetPasswordPage params={params} />}
          </Route>
          
          <Route path="/onboarding">
            {() => (
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/">
            {() => (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/dashboard">
            {() => (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/settings/onboarding">
            {() => (
              <ProtectedRoute>
                <SettingsOnboardingPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/settings">
            {() => (
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/condiciones">
            {() => (
              <ProtectedRoute>
                <ConditionsPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/pacientes">
            {() => (
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/paciente/:id">
            {(params) => (
              <ProtectedRoute>
                <PatientDetailPage params={params} />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route>
            {() => <NotFound />}
          </Route>
        </Switch>
        <Toaster />
      </AuthProvider>
    </div>
  );
};

// Componente principal de la aplicación con todos los proveedores
export default function App() {
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(false);
  const clientId = "759420300435-1978tfdvh2ugducrmcd0crspn25u1a31.apps.googleusercontent.com";

  useEffect(() => {
    let isMounted = true;
    
    const checkAuthMethods = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/auth-methods", null);
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
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}