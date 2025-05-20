import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useOnboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [shouldCheck, setShouldCheck] = useState(false);
  
  // Estado para seguimiento de redirección
  const [hasRedirected, setHasRedirected] = useState(false);

  // Verificar si el usuario ha completado el onboarding
  const { data: onboardingStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/onboarding/status", null, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Error al verificar estado de onboarding");
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Error al verificar estado de onboarding");
        }
        
        return data.data;
      } catch (error) {
        console.error("Error verificando estado de onboarding:", error);
        // Si hay un error, asumimos que no ha completado el onboarding para estar seguros
        return { has_completed_onboarding: false };
      }
    },
    enabled: isAuthenticated && !isLoading && shouldCheck && !hasRedirected,
    refetchOnWindowFocus: false
  });
  
  // Efecto para verificar si debemos redirigir al usuario
  useEffect(() => {
    // Solo verificamos cuando el usuario está autenticado y no estamos cargando
    if (isAuthenticated && !isLoading && !shouldCheck) {
      setShouldCheck(true);
    }
  }, [isAuthenticated, isLoading]);
  
  // Efecto para redirigir al usuario si no ha completado el onboarding
  useEffect(() => {
    if (onboardingStatus && !isCheckingStatus && !hasRedirected) {
      const hasCompleted = onboardingStatus.has_completed_onboarding;
      
      // Si estamos en la página de onboarding y ya lo ha completado, redirigir al dashboard
      if (window.location.pathname === "/onboarding" && hasCompleted) {
        navigate("/dashboard");
        setHasRedirected(true);
      } 
      // Si no estamos en la página de onboarding y no lo ha completado, redirigir al onboarding
      else if (window.location.pathname !== "/onboarding" && !hasCompleted) {
        navigate("/onboarding");
        setHasRedirected(true);
      }
    }
  }, [onboardingStatus, isCheckingStatus, hasRedirected, navigate]);
  
  return {
    hasCompletedOnboarding: onboardingStatus?.has_completed_onboarding || false,
    isCheckingOnboardingStatus: isCheckingStatus,
    onboardingData: onboardingStatus?.onboarding_data
  };
}