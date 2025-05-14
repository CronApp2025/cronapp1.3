import { useState, useEffect } from "react";
import { 
  Eye, 
  Bell, 
  AlertTriangle, 
  ClipboardList, 
  Check, 
  Heart, 
  Activity, 
  UserCheck, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RISK_ALERTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "../../shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter 
} from "@/components/ui/drawer";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { formatDateString } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Componente para la alerta de riesgo individual
const RiskAlertItem = ({ 
  alert, 
  onClick 
}: { 
  alert: any, 
  onClick: (alert: any) => void 
}) => {
  const getSeverityColor = (riskLevel: number | null) => {
    if (!riskLevel) return { bg: "bg-green-500", text: "text-green-600", indicatorBg: "bg-green-500" };
    if (riskLevel >= 90) return { bg: "bg-red-500", text: "text-[#f44336]", indicatorBg: "bg-[#f44336]" };
    if (riskLevel >= 70) return { bg: "bg-amber-500", text: "text-[#ff9800]", indicatorBg: "bg-[#ff9800]" };
    if (riskLevel >= 50) return { bg: "bg-yellow-500", text: "text-yellow-600", indicatorBg: "bg-yellow-500" };
    return { bg: "bg-green-500", text: "text-green-600", indicatorBg: "bg-green-500" };
  };
  
  const severityColor = getSeverityColor(alert.riskLevel);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="mb-4 border border-neutral-100 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onClick(alert)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-neutral-800">Paciente #{alert.patientId}</h4>
          <p className="text-xs text-neutral-500">{alert.alertType}</p>
        </div>
        <span className="text-xs bg-primary-50 text-primary px-2 py-1 rounded">{alert.time}</span>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-neutral-600">Nivel de Riesgo</div>
        <div className={`text-sm font-semibold ${severityColor.text}`}>{alert.riskLevel}%</div>
      </div>
      <Progress 
        value={alert.riskLevel} 
        className="h-2 bg-neutral-100 mt-1" 
        indicatorClassName={severityColor.indicatorBg} 
      />
    </motion.div>
  );
};

// Datos adicionales y acciones para detalles de alerta
const riskAlertDetails = {
  "Alerta de Hipertensión": {
    icon: "heart",
    interventions: [
      "Control de medicación diario",
      "Restricción de sodio en dieta",
      "Monitoreo de estrés",
      "Actividad física moderada"
    ],
    criticalAction: "Evaluación cardiológica urgente"
  },
  "Monitoreo de Glucosa": {
    icon: "activity",
    interventions: [
      "Ajuste de dosis de insulina",
      "Control dietético estricto",
      "Monitoreo cada 4 horas",
      "Revisión de medicación actual"
    ],
    criticalAction: "Contacto con médico tratante"
  },
  "Nivel de Dolor": {
    icon: "alertTriangle",
    interventions: [
      "Evaluación de terapia actual",
      "Ajuste de analgésicos",
      "Terapia física complementaria",
      "Evaluación psicológica de impacto"
    ],
    criticalAction: "Interconsulta con unidad de dolor"
  },
  "Presión Arterial": {
    icon: "heart",
    interventions: [
      "Monitoreo continuo por 24h",
      "Revisión de adherencia a medicación",
      "Evaluación de factores de estrés",
      "Restricción de actividad física intensa"
    ],
    criticalAction: "Evaluación de daño a órgano blanco"
  },
  "Crisis de Ansiedad": {
    icon: "brain",
    interventions: [
      "Técnicas de respiración y relajación",
      "Evaluación psiquiátrica",
      "Revisión de medicación ansiolítica",
      "Seguimiento diario"
    ],
    criticalAction: "Interconsulta con salud mental"
  }
};

// Componente para mostrar detalles completos de una alerta
const AlertDetails = ({ 
  alert, 
  onClose, 
  onResolve 
}: { 
  alert: any, 
  onClose: () => void, 
  onResolve: () => void 
}) => {
  const details = riskAlertDetails[alert.alertType as keyof typeof riskAlertDetails] || {
    icon: "alertTriangle",
    interventions: ["Evaluación general requerida"],
    criticalAction: "Contactar al médico responsable"
  };
  
  const IconComponent = details.icon === 'heart' ? Heart : 
                       details.icon === 'brain' ? Activity : AlertTriangle;
  
  const getSeverityLevel = (riskLevel: number | null) => {
    if (!riskLevel) return "Normal";
    if (riskLevel >= 90) return "Crítico";
    if (riskLevel >= 70) return "Alto";
    if (riskLevel >= 50) return "Moderado";
    return "Bajo";
  };
  
  const severityLevel = getSeverityLevel(alert.riskLevel);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className={`w-10 h-10 ${alert.riskColor === 'danger' ? 'bg-red-100 text-[#f44336]' : 'bg-amber-100 text-[#ff9800]'} rounded-md flex items-center justify-center mr-4`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-xl font-semibold text-neutral-800 mr-2">{alert.alertType}</h3>
            <Badge className={`${alert.riskColor === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              {severityLevel}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">Paciente #{alert.patientId} • {alert.time}</p>
        </div>
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-md">
        <h4 className="font-semibold text-neutral-700 mb-2">Nivel de Riesgo</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Severidad:</span>
          <span className={`font-semibold ${alert.riskColor === 'danger' ? 'text-[#f44336]' : 'text-[#ff9800]'}`}>
            {alert.riskLevel}%
          </span>
        </div>
        <Progress 
          value={alert.riskLevel} 
          className="h-3 bg-neutral-200" 
          indicatorClassName={alert.riskColor === 'danger' ? 'bg-[#f44336]' : 'bg-[#ff9800]'} 
        />
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-md">
        <h4 className="font-semibold text-neutral-700 mb-2">Intervenciones Recomendadas</h4>
        <ul className="space-y-2">
          {details.interventions.map((intervention, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-neutral-700">{intervention}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-red-50 p-4 rounded-md">
        <h4 className="font-semibold text-red-700 mb-2 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Acción Crítica Requerida
        </h4>
        <p className="text-sm text-red-600">{details.criticalAction}</p>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          onClick={onClose} 
          variant="outline"
        >
          Cerrar
        </Button>
        <Button 
          onClick={onResolve}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-2" />
          Marcar Atendida
        </Button>
      </div>
    </div>
  );
};

// Componente principal
export function RiskMonitoring() {
  const isMobile = useIsMobile();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isAlertDetailsOpen, setIsAlertDetailsOpen] = useState(false);
  const [isAllAlertsOpen, setIsAllAlertsOpen] = useState(false);
  
  // Obtener las alertas reales de la base de datos
  const { data: dbAlerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      return await apiRequest('/api/alerts');
    }
  });
  
  // Inicializar alertas desde los datos constantes
  useEffect(() => {
    setAlerts(RISK_ALERTS);
  }, []);
  
  // Función para manejar clic en una alerta
  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setIsAlertDetailsOpen(true);
  };
  
  // Función para resolver una alerta
  const handleResolveAlert = () => {
    setAlerts(alerts.filter((a) => a.id !== selectedAlert.id));
    toast({
      title: "Alerta Resuelta",
      description: `La alerta para el Paciente #${selectedAlert.patientId} ha sido atendida.`,
    });
    setIsAlertDetailsOpen(false);
  };
  
  // Componente para el diálogo de detalles de alerta (responsivo)
  const AlertDetailsDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={isAlertDetailsOpen} onOpenChange={setIsAlertDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Detalles de la Alerta</DrawerTitle>
              <DrawerDescription>Información detallada y acciones recomendadas</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {selectedAlert && (
                <AlertDetails 
                  alert={selectedAlert} 
                  onClose={() => setIsAlertDetailsOpen(false)}
                  onResolve={handleResolveAlert}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isAlertDetailsOpen} onOpenChange={setIsAlertDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Alerta</DialogTitle>
            <DialogDescription>Información detallada y acciones recomendadas</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <AlertDetails 
              alert={selectedAlert} 
              onClose={() => setIsAlertDetailsOpen(false)}
              onResolve={handleResolveAlert}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  // Componente para el diálogo de todas las alertas (responsivo)
  const AllAlertsDialog = () => {
    const allAlerts = [
      ...RISK_ALERTS,
      {
        id: 3,
        patientId: 42,
        alertType: "Nivel de Dolor",
        time: "1d ago",
        riskLevel: 65,
        riskColor: "warning"
      },
      {
        id: 4,
        patientId: 28,
        alertType: "Presión Arterial",
        time: "3h ago",
        riskLevel: 88,
        riskColor: "danger"
      },
      {
        id: 5,
        patientId: 55,
        alertType: "Crisis de Ansiedad",
        time: "30m ago",
        riskLevel: 72,
        riskColor: "warning"
      }
    ];
    
    if (isMobile) {
      return (
        <Drawer open={isAllAlertsOpen} onOpenChange={setIsAllAlertsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Todas las Alertas</DrawerTitle>
              <DrawerDescription>Lista completa de alertas del sistema</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {allAlerts.map((alert) => (
                <RiskAlertItem 
                  key={alert.id} 
                  alert={alert} 
                  onClick={(a) => {
                    setSelectedAlert(a);
                    setIsAlertDetailsOpen(true);
                    setIsAllAlertsOpen(false);
                  }} 
                />
              ))}
            </div>
            <DrawerFooter>
              <Button onClick={() => setIsAllAlertsOpen(false)} variant="outline">
                Cerrar
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isAllAlertsOpen} onOpenChange={setIsAllAlertsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Todas las Alertas</DialogTitle>
            <DialogDescription>Lista completa de alertas del sistema</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {allAlerts.map((alert) => (
              <RiskAlertItem 
                key={alert.id} 
                alert={alert} 
                onClick={(a) => {
                  setSelectedAlert(a);
                  setIsAlertDetailsOpen(true);
                  setIsAllAlertsOpen(false);
                }} 
              />
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAllAlertsOpen(false)} variant="outline">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-start mb-4">
        <div className="w-8 h-8 bg-[#fff8e1] text-[#ff9800] rounded-md flex items-center justify-center mr-3">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Monitoreo de Riesgos</h3>
            <p className="text-sm text-neutral-500">Alertas de pacientes que requieren atención</p>
          </div>
          <Badge className="self-start sm:self-center mt-2 sm:mt-0 bg-red-100 text-red-600 border-none">
            {alerts.length} Alertas Activas
          </Badge>
        </div>
      </div>
      
      {/* Lista de alertas */}
      {alerts.map((alert) => (
        <RiskAlertItem 
          key={alert.id} 
          alert={alert} 
          onClick={handleAlertClick} 
        />
      ))}
      
      <Button 
        variant="secondary" 
        className="w-full py-2 px-4 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-md flex items-center justify-center"
        onClick={() => setIsAllAlertsOpen(true)}
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        <span>Ver Todas las Alertas</span>
      </Button>
      
      {/* Diálogos y drawers */}
      <AlertDetailsDialog />
      <AllAlertsDialog />
    </motion.div>
  );
}

export default RiskMonitoring;
