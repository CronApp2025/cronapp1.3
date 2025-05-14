import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SettingsFormNew } from "@/components/dashboard/settings/settings-form-new";

// Components imports
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PatientProfile } from "@/components/dashboard/PatientProfile";
import { RiskMonitoring } from "@/components/dashboard/RiskMonitoring";
import { ConditionManagement } from "@/components/dashboard/ConditionManagement";
import { ClinicalEducation } from "@/components/dashboard/ClinicalEducation";

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

const ConditionsPage = () => (
  <DashboardLayout>
    <ConditionManagement />
  </DashboardLayout>
);

const PatientsPage = () => (
  <DashboardLayout>
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Listado de Pacientes</h2>
      <p className="text-neutral-600">
        Esta sección está en desarrollo. Pronto podrás ver un listado completo de tus pacientes.
      </p>
    </div>
  </DashboardLayout>
);

const StatsPage = () => (
  <DashboardLayout>
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Estadísticas y Análisis</h2>
      <p className="text-neutral-600">
        Esta sección está en desarrollo. Próximamente podrás ver estadísticas y análisis de tus pacientes.
      </p>
    </div>
  </DashboardLayout>
);

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Agregar logs para depuración
  console.log("AppContent: Ubicación actual:", location);
  
  // Lista explícita de rutas públicas
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  
  // Comprobar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => 
    typeof location === 'string' && location.startsWith(route)
  );

  // Explícitamente excluir las rutas de reset-password, que ahora se manejan completamente
  // fuera de AppContent en el componente App principal
  const isResetPasswordRoute = typeof location === 'string' && location.startsWith('/reset-password/');
  
  // Si es una ruta de reseteo, no hacemos nada (se manejará en App.tsx)
  if (isResetPasswordRoute) {
    console.log("AppContent: Ignorando ruta de reseteo, se maneja en App principal");
    return null;
  }

  // Si no está autenticado o es una ruta pública, mostrar las rutas públicas
  if (isPublicRoute || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="*" component={() => <Route path="/login" component={LoginPage} />} /> {/* Redirect unmatched routes to login */}
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/settings" component={() => (
        <DashboardLayout>
          <SettingsFormNew />
        </DashboardLayout>
      )} />
      <Route path="/condiciones" component={ConditionsPage} />
      <Route path="/pacientes" component={PatientsPage} />
      <Route path="/estadisticas" component={StatsPage} />
      <Route component={NotFound} />
    </Switch>
  );
};

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
  // Simplificamos completamente el manejo - un solo punto de entrada
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Switch>
              {/* Las rutas públicas */}
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/forgot-password" component={ForgotPasswordPage} />
              <Route path="/reset-password/:token">
                {(params) => <ResetPasswordPage params={params} />}
              </Route>
              
              {/* Rutas que requieren autenticación */}
              <Route path="/">
                {() => {
                  const { isAuthenticated } = useAuth();
                  if (!isAuthenticated) {
                    return <LoginPage />;
                  }
                  return <DashboardPage />;
                }}
              </Route>
              <Route path="/dashboard">
                {() => {
                  const { isAuthenticated } = useAuth();
                  if (!isAuthenticated) {
                    return <LoginPage />;
                  }
                  return <DashboardPage />;
                }}
              </Route>
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
                  const { isAuthenticated } = useAuth();
                  if (!isAuthenticated) {
                    return <LoginPage />;
                  }
                  return <PatientsPage />;
                }}
              </Route>
              <Route path="/estadisticas">
                {() => {
                  const { isAuthenticated } = useAuth();
                  if (!isAuthenticated) {
                    return <LoginPage />;
                  }
                  return <StatsPage />;
                }}
              </Route>
              
              {/* Ruta para manejar 404s */}
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </div>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}