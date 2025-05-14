import React, { useEffect, useState } from "react";
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
import { motion } from "framer-motion";
import { MOCK_PATIENTS } from "@/lib/constants";
import { formatDateString } from "@/lib/utils";
import { usePatients } from "@/hooks/use-patient";
import { Alert, Condition, Patient } from "@shared/schema";

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
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

  // Consulta para obtener todos los pacientes
  const { 
    data: usersData,
    isLoading: loadingPatients,
    error: patientsError 
  } = usePatients();

  // Convertir usuarios a formato de paciente
  useEffect(() => {
    if (usersData && Array.isArray(usersData)) {
      // Mapear usuarios a formato de paciente
      const mappedPatients = usersData.map((user: User) => ({
        id: user.id,
        fullName: `${user.nombre} ${user.apellido}`,
        age: calculateAge(user.fecha_nacimiento),
        gender: "Masculino", // Este dato no está disponible en el modelo actual
        status: "active",
        fecha_nacimiento: user.fecha_nacimiento.toString(),
        conditions: [] // Las condiciones se cargarían de forma separada
      }));
      
      if (mappedPatients.length > 0) {
        setPatients(mappedPatients);
      }
    }
  }, [usersData]);

  // Función para calcular la edad
  function calculateAge(birthDateStr: string): number {
    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // Ajustar la edad si no ha cumplido años todavía este año
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      console.error("Error calculando edad:", e);
      return 0;
    }
  }

  // Obtener el paciente actual basado en el índice
  const patient = patients[currentPatientIndex];

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

  // Datos de ejemplo para condiciones y alertas mientras se integra la API
  const conditions = patient.conditions || [];
  const alerts: Alert[] = [];

  // Encontrar la condición principal y cualquier alerta crítica
  const primaryCondition = conditions[0];
  const secondaryCondition = conditions[1];
  const criticalAlert = alerts.find((a: Alert) => (a.risk_level || 0) > 80);

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
                        Actualizado: {primaryCondition.lastUpdated ? formatDateString(primaryCondition.lastUpdated) : 'N/A'}
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
                        Actualizado: {secondaryCondition.lastUpdated ? formatDateString(secondaryCondition.lastUpdated) : 'N/A'}
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
                        Alto ({criticalAlert.risk_level || 0}%)
                      </div>
                      <Progress 
                        value={criticalAlert.risk_level || 0} 
                        className="h-2 bg-neutral-200" 
                        indicatorClassName={getSeverityColor(criticalAlert.risk_level)}
                      />
                    </motion.div>
                  )}

                  {/* Si no hay condiciones, mostrar mensaje */}
                  {conditions.length === 0 && (
                    <div className="col-span-3 bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-neutral-600">No hay condiciones médicas registradas</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Opciones de pestaña */}
      <Tabs defaultValue="historia" className="p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="historia">Historia Clínica</TabsTrigger>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="historia" className="space-y-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Historial Clínico</h3>
            {conditions.length === 0 ? (
              <p className="text-sm text-neutral-600">No hay historial clínico disponible para este paciente.</p>
            ) : (
              <div className="space-y-3">
                {conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {condition.icon === 'heart' ? 
                        <Heart className="h-4 w-4 text-blue-600" /> : 
                        <Activity className="h-4 w-4 text-blue-600" />
                      }
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-800">{condition.name}</h4>
                      <p className="text-xs text-neutral-500">Registrado: {formatDateString(condition.lastUpdated || new Date().toISOString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tratamientos">
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Tratamientos Actuales</h3>
            <p className="text-sm text-neutral-600">No hay tratamientos activos registrados.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notas">
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Notas Clínicas</h3>
            <p className="text-sm text-neutral-600">No hay notas disponibles para este paciente.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="estadisticas">
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Estadísticas del Paciente</h3>
            <p className="text-sm text-neutral-600">No hay estadísticas disponibles para mostrar.</p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}