import { useEffect, useState } from "react";
import { 
  Activity, 
  CalendarDays, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  CircleUser, 
  Clock, 
  Download,
  FileText, 
  Heart, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import type { Patient, Condition, Alert } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Variantes para animaciones
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5 } 
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 } 
  }
};

// Componente para mostrar el perfil del paciente
export function PatientProfile() {
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);

  // Consulta para obtener todos los pacientes
  const { 
    data: patients = [], 
    isLoading: loadingPatients,
    error: patientsError 
  } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      return await apiRequest('/api/patients');
    }
  });

  // Obtener el paciente actual basado en el índice
  const patient = patients[currentPatientIndex];

  // Consulta para obtener condiciones del paciente actual
  const { 
    data: conditions = [], 
    isLoading: loadingConditions,
    refetch: refetchConditions
  } = useQuery<Condition[]>({
    queryKey: ['/api/conditions', patient?.id],
    queryFn: async () => {
      if (!patient) return [];
      return await apiRequest(`/api/conditions?patientId=${patient.id}`);
    },
    enabled: !!patient
  });

  // Consulta para obtener alertas del paciente actual
  const { 
    data: alerts = [], 
    isLoading: loadingAlerts,
    refetch: refetchAlerts
  } = useQuery<Alert[]>({
    queryKey: ['/api/alerts', patient?.id],
    queryFn: async () => {
      if (!patient) return [];
      return await apiRequest(`/api/alerts?patientId=${patient.id}`);
    },
    enabled: !!patient
  });

  // Refetch cuando cambia el paciente
  useEffect(() => {
    if (patient) {
      refetchConditions();
      refetchAlerts();
    }
  }, [patient, refetchConditions, refetchAlerts]);

  // Manejar cambio de paciente con el carrusel
  const handlePreviousPatient = () => {
    if (currentPatientIndex > 0) {
      setCurrentPatientIndex(prev => prev - 1);
    } else {
      // Si estamos en el primer paciente, ir al último
      setCurrentPatientIndex(patients.length - 1);
    }
  };

  const handleNextPatient = () => {
    if (currentPatientIndex < patients.length - 1) {
      setCurrentPatientIndex(prev => prev + 1);
    } else {
      // Si estamos en el último paciente, volver al primero
      setCurrentPatientIndex(0);
    }
  };

  // En caso de error en la carga de pacientes
  if (patientsError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CircleUser className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-800">Error al cargar pacientes</h3>
            <p className="text-neutral-500">No se pudieron obtener los datos de los pacientes</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar un estado de carga mientras se obtienen los datos
  if (loadingPatients || patients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-24 h-24 rounded-full bg-neutral-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CircleUser className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-800">No se encontró el paciente</h3>
            <p className="text-neutral-500">La información del paciente no está disponible</p>
          </div>
        </div>
      </div>
    );
  }

  // Función para obtener el color de severidad basado en el nivel de riesgo
  const getSeverityColor = (riskLevel: number | null) => {
    if (!riskLevel) return "bg-[#4caf50]";
    if (riskLevel >= 90) return "bg-[#f44336]";
    if (riskLevel >= 70) return "bg-[#ff9800]";
    if (riskLevel >= 50) return "bg-[#ffeb3b]";
    return "bg-[#4caf50]";
  };

  // Encontrar la condición principal y cualquier alerta crítica
  const primaryCondition = conditions[0];
  const secondaryCondition = conditions[1];
  const criticalAlert = alerts.find((a: Alert) => (a.riskLevel || 0) > 80);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden"
    >
      {/* Header con navegación de pacientes */}
      <div className="p-4 sm:p-6 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Perfil del Paciente</h2>
            <div className="flex items-center mt-2 sm:mt-0 sm:ml-4 space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-neutral-100 transition-colors"
                onClick={handlePreviousPatient}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-neutral-500">
                {currentPatientIndex + 1} de {patients.length}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-neutral-100 transition-colors"
                onClick={handleNextPatient}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full flex-shrink-0">
              {patient.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex-shrink-0 min-w-max whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="sm:inline">Descargar Historia</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Info del paciente (usando Carousel para animación) */}
      <Carousel 
        className="w-full" 
        key={patient.id}
      >
        <CarouselContent>
          <CarouselItem>
            <motion.div 
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="p-6 border-b border-neutral-100"
            >
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="md:w-1/4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-100 to-blue-300 flex items-center justify-center mx-auto md:mx-0 mb-3 transition-all hover:shadow-lg">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-800">{patient.fullName}</h3>
                    <p className="text-neutral-500 flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1">
                      <span className="flex items-center">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        <span className="text-sm">{patient.age} años</span>
                      </span>
                      <span className="hidden sm:inline text-neutral-300">•</span>
                      <span className="flex items-center">
                        <CircleUser className="h-3 w-3 mr-1" />
                        <span className="text-sm">{patient.gender}</span>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-0">
                  {primaryCondition && (
                    <motion.div 
                      className="bg-blue-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center mb-2">
                        {primaryCondition.icon === 'activity' ? 
                          <Activity className="h-4 w-4 text-primary mr-2" /> : 
                          <Heart className="h-4 w-4 text-primary mr-2" />
                        }
                        <h4 className="text-sm font-semibold text-neutral-700">Diagnóstico Principal</h4>
                      </div>
                      <div className="text-lg font-semibold text-neutral-800 mb-1">{primaryCondition.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Actualizado: {primaryCondition.lastUpdated ? new Date(primaryCondition.lastUpdated).toLocaleDateString() : 'N/A'}
                      </div>
                    </motion.div>
                  )}

                  {secondaryCondition && (
                    <motion.div 
                      className="bg-red-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center mb-2">
                        {secondaryCondition.icon === 'heart' ? 
                          <Heart className="h-4 w-4 text-[#f44336] mr-2" /> : 
                          <Activity className="h-4 w-4 text-[#f44336] mr-2" />
                        }
                        <h4 className="text-sm font-semibold text-neutral-700">Condición Secundaria</h4>
                      </div>
                      <div className="text-lg font-semibold text-neutral-800 mb-1">{secondaryCondition.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Actualizado: {secondaryCondition.lastUpdated ? new Date(secondaryCondition.lastUpdated).toLocaleDateString() : 'N/A'}
                      </div>
                    </motion.div>
                  )}

                  {criticalAlert && (
                    <motion.div 
                      className="bg-amber-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center mb-2">
                        <Activity className="h-4 w-4 text-[#ff9800] mr-2" />
                        <h4 className="text-sm font-semibold text-neutral-700">Nivel de Riesgo</h4>
                      </div>
                      <div className="text-lg font-semibold text-neutral-800 mb-1">
                        Alto ({criticalAlert.riskLevel || 0}%)
                      </div>
                      <Progress 
                        value={criticalAlert.riskLevel || 0} 
                        className="h-2 bg-neutral-200" 
                        indicatorClassName="bg-[#ff9800]" 
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Tabs con datos del paciente - SOLUCIÓN PARA LA PARTE RESPONSIVA */}
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="conditions">
          {/* Aquí está la modificación principal para solucionar el problema de superposición */}
          <TabsList className="flex flex-row w-full mb-4 sm:mb-6 overflow-x-auto">
            <TabsTrigger 
              value="conditions" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-1 text-sm whitespace-nowrap"
            >
              Condiciones
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-1 text-sm whitespace-nowrap"
            >
              Alertas
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-1 text-sm whitespace-nowrap"
            >
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Condiciones */}
          <TabsContent value="conditions" className="space-y-4">
            {loadingConditions ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-neutral-100 rounded"></div>
                <div className="h-20 bg-neutral-100 rounded"></div>
              </div>
            ) : conditions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-700">Sin condiciones registradas</h3>
                <p className="text-neutral-500">Este paciente no tiene condiciones médicas registradas</p>
              </div>
            ) : (
              conditions.map((condition: Condition) => (
                <motion.div 
                  key={condition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border border-neutral-100 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 bg-${condition.color || 'blue'}-100 text-${condition.color || 'blue'}-600 rounded-md flex items-center justify-center mr-4 flex-shrink-0`}>
                      {condition.icon === 'activity' ? (
                        <Activity className="h-5 w-5" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-1">{condition.name}</h3>
                        <span className="text-xs text-neutral-500">
                          Actualizado: {condition.lastUpdated ? new Date(condition.lastUpdated).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">{condition.type}</p>

                      <div className="mt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                        <Button 
                          variant="outline" 
                          className="px-3 py-1 border text-blue-600 hover:bg-blue-50 rounded-md flex items-center justify-center text-sm transition-colors"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Ver Detalles</span>
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Pestaña de Alertas */}
          <TabsContent value="alerts" className="space-y-4">
            {loadingAlerts ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-neutral-100 rounded"></div>
                <div className="h-20 bg-neutral-100 rounded"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-700">Sin alertas activas</h3>
                <p className="text-neutral-500">Este paciente no tiene alertas activas</p>
              </div>
            ) : (
              alerts.map((alert: Alert) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border border-neutral-100 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-neutral-800">{alert.alertType}</h4>
                      <p className="text-xs text-neutral-500">
                        Creado: {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${alert.riskColor === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {alert.riskLevel}% de riesgo
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm text-neutral-600 mb-1">Nivel de Riesgo</div>
                    <div className="relative h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${alert.riskLevel || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={getSeverityColor(alert.riskLevel)}
                        style={{ height: '100%' }}
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Pestaña de Historial */}
          <TabsContent value="history">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="border border-neutral-100 rounded-lg p-4 sm:p-6"
            >
              <div className="text-center">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-neutral-800">Historial Médico</h3>
                <p className="text-sm text-neutral-500 mb-3 sm:mb-4 px-2">El historial médico completo está disponible para revisión</p>
                <Button className="bg-primary text-white hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto justify-center">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Descargar Historial
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

export default PatientProfile;