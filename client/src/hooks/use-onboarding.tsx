import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useOnboarding() {
  const auth = useAuth();
  const { user, isAuthenticated, isLoading } = auth;
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
    enabled: isAuthenticated === true && isLoading === false && shouldCheck === true && hasRedirected === false,
    refetchOnWindowFocus: false
  });
  
  // Efecto para verificar si debemos redirigir al usuario
  useEffect(() => {
    // Solo verificamos cuando el usuario está autenticado y no estamos cargando
    if (isAuthenticated && !isLoading && !shouldCheck) {
      setShouldCheck(true);
    }
  }, [isAuthenticated, isLoading, shouldCheck]);
  
  // Efecto para redirigir al usuario si no ha completado el onboarding
  useEffect(() => {
    // Evitamos dependencia circular y ejecuciones innecesarias
    if (!onboardingStatus || isCheckingStatus || hasRedirected) {
      return;
    }
    
    const hasCompleted = onboardingStatus.has_completed_onboarding;
    const currentPath = window.location.pathname;
    
    // Solo redirigimos si hay un cambio real necesario
    if ((currentPath === "/onboarding" && hasCompleted) || 
        (currentPath !== "/onboarding" && !hasCompleted)) {
          
      const redirectPath = hasCompleted ? "/dashboard" : "/onboarding";
      navigate(redirectPath);
      setHasRedirected(true);
    }
  }, [onboardingStatus, isCheckingStatus, hasRedirected, navigate]);
  
  return {
    hasCompletedOnboarding: onboardingStatus?.has_completed_onboarding || false,
    isCheckingOnboardingStatus: isCheckingStatus,
    onboardingData: onboardingStatus?.onboarding_data
  };
}