
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

export function useSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/settings');
      const jsonResponse = await response.json();
      if (!jsonResponse.success) {
        throw new Error(jsonResponse.msg || 'Error al obtener configuración');
      }
      return jsonResponse.data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const response = await apiRequest('PUT', '/api/settings', newSettings);
      
      // Necesitamos convertir la respuesta a JSON
      const jsonResponse = await response.json();
      
      if (!jsonResponse.success) {
        throw new Error(jsonResponse.msg || 'Error al actualizar configuración');
      }
      
      return jsonResponse.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.setQueryData(['user'], (oldData: any) => ({
        ...oldData,
        ...data
      }));
      
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente"
      });
    },
    onError: (error: any) => {
      console.error('Error al actualizar settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la configuración"
      });
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate
  };
}
