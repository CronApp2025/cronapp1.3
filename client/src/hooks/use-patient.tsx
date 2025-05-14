import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CONDITIONS, EDUCATIONAL_RESOURCES, MOCK_PATIENTS, RISK_ALERTS } from "@/lib/constants";
import { Alert, Condition, EducationalResource, Patient, PatientProfile } from "@/lib/types";

// Hook para obtener todos los pacientes
export function usePatients() {
  return useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/patients");
        return await response.json();
      } catch (error) {
        // En caso de error, usamos los datos de ejemplo
        console.warn("Usando datos de ejemplo para pacientes");
        return MOCK_PATIENTS;
      }
    },
    initialData: MOCK_PATIENTS
  });
}

// Hook para obtener los datos de un paciente específico
export function usePatient(id: number | string | undefined) {
  return useQuery({
    queryKey: ["/api/patients", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de paciente no proporcionado");
      
      try {
        const response = await apiRequest("GET", `/api/patients/${id}`);
        return await response.json();
      } catch (error) {
        // En caso de error, usamos un paciente de ejemplo
        console.warn("Usando datos de ejemplo para paciente");
        return MOCK_PATIENTS.find(patient => patient.id.toString() === id.toString()) || null;
      }
    },
    enabled: !!id,
    initialData: id ? MOCK_PATIENTS.find(patient => patient.id.toString() === id.toString()) || null : null
  });
}

// Hook para actualizar un paciente
export function useUpdatePatient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PatientProfile> }) => {
      const response = await apiRequest("PATCH", `/api/patients/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", data.id] });
      
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente han sido actualizados correctamente.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar un paciente
export function useDeletePatient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/patients/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado correctamente.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook para agregar un paciente
export function useAddPatient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Omit<PatientProfile, "id">) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      
      toast({
        title: "Paciente agregado",
        description: "El paciente ha sido agregado correctamente.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar el paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener las condiciones médicas de un paciente
export function useConditions(patientId?: number | string) {
  return useQuery({
    queryKey: ["/api/conditions", patientId],
    queryFn: async () => {
      if (patientId) {
        try {
          const response = await apiRequest("GET", `/api/patients/${patientId}/conditions`);
          return await response.json();
        } catch (error) {
          console.warn("Usando datos de ejemplo para condiciones");
        }
      }
      return CONDITIONS;
    },
    initialData: CONDITIONS
  });
}

// Hook para obtener las alertas de un paciente
export function useAlerts(patientId?: number | string) {
  return useQuery({
    queryKey: ["/api/alerts", patientId],
    queryFn: async () => {
      if (patientId) {
        try {
          const response = await apiRequest("GET", `/api/patients/${patientId}/alerts`);
          return await response.json();
        } catch (error) {
          console.warn("Usando datos de ejemplo para alertas");
        }
      }
      return RISK_ALERTS;
    },
    initialData: RISK_ALERTS
  });
}

// Hook para obtener recursos educativos
export function useEducationalResources(category?: string) {
  return useQuery({
    queryKey: ["/api/educational-resources", category],
    queryFn: async () => {
      try {
        const url = category 
          ? `/api/educational-resources?category=${category}`
          : '/api/educational-resources';
        const response = await apiRequest("GET", url);
        return await response.json();
      } catch (error) {
        console.warn("Usando datos de ejemplo para recursos educativos");
        return category 
          ? EDUCATIONAL_RESOURCES.filter(r => r.category === category)
          : EDUCATIONAL_RESOURCES;
      }
    },
    initialData: category 
      ? EDUCATIONAL_RESOURCES.filter(r => r.category === category)
      : EDUCATIONAL_RESOURCES
  });
}

// Hook para obtener todos los datos relacionados a un paciente
export function usePatientData(patientId: string | number) {
  const patientQuery = usePatient(patientId);
  const conditionsQuery = useConditions(patientId);
  const alertsQuery = useAlerts(patientId);
  
  const isLoading = patientQuery.isLoading || conditionsQuery.isLoading || alertsQuery.isLoading;
  const isError = patientQuery.isError || conditionsQuery.isError || alertsQuery.isError;
  
  return {
    patient: patientQuery.data,
    conditions: conditionsQuery.data,
    alerts: alertsQuery.data,
    isLoading,
    isError
  };
}

// Hook para monitoreo de riesgos
export function useRiskMonitoring() {
  return useQuery({
    queryKey: ["/api/risk-monitoring"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/risk-monitoring");
        return await response.json();
      } catch (error) {
        console.warn("Usando datos de ejemplo para monitoreo de riesgos");
        return {
          alerts: RISK_ALERTS,
          statistics: {
            critical: 1,
            warning: 2,
            normal: 5
          }
        };
      }
    },
    initialData: {
      alerts: RISK_ALERTS,
      statistics: {
        critical: 1,
        warning: 2,
        normal: 5
      }
    }
  });
}

// Hook para asistente clínico
export function useClinicalAssistant() {
  return useQuery({
    queryKey: ["/api/clinical-assistant"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/clinical-assistant");
        return await response.json();
      } catch (error) {
        console.warn("Usando datos de ejemplo para asistente clínico");
        return {
          messages: [
            {
              id: 1,
              icon: "alert-circle",
              message: "El paciente María García muestra signos de presión arterial elevada en los últimos 3 días.",
              actions: {
                primary: "Revisar paciente",
                secondary: "Programar cita"
              }
            },
            {
              id: 2,
              icon: "clipboard-check",
              message: "Se ha actualizado el protocolo de manejo para pacientes con diabetes tipo 2.",
              actions: {
                primary: "Ver cambios",
                secondary: "Ignorar"
              }
            }
          ]
        };
      }
    },
    initialData: {
      messages: [
        {
          id: 1,
          icon: "alert-circle",
          message: "El paciente María García muestra signos de presión arterial elevada en los últimos 3 días.",
          actions: {
            primary: "Revisar paciente",
            secondary: "Programar cita"
          }
        },
        {
          id: 2,
          icon: "clipboard-check",
          message: "Se ha actualizado el protocolo de manejo para pacientes con diabetes tipo 2.",
          actions: {
            primary: "Ver cambios",
            secondary: "Ignorar"
          }
        }
      ]
    }
  });
}