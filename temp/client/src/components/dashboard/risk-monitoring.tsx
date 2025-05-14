import { Button } from "@/components/ui/button";
import { RiskAlert } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface RiskMonitoringProps {
  riskAlerts: RiskAlert[];
}

export function RiskMonitoring({ riskAlerts }: RiskMonitoringProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          Monitoreo de Riesgos
        </h2>
        <span className="text-xs text-primary font-medium">
          {riskAlerts.length} Alertas Activas
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Niveles de parámetros con alertas
      </p>
      
      {/* Patient Risk Cards */}
      {riskAlerts.map((alert) => (
        <div key={alert.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex justify-between mb-2">
            <div>
              <h3 className="font-medium">Paciente #{alert.patientId}</h3>
              <p className="text-xs text-gray-500">{alert.description}</p>
            </div>
            <span className="text-xs bg-neutral px-2 py-0.5 rounded">{alert.days} días</span>
          </div>
          <div className="w-full bg-neutral rounded-full h-2">
            <div 
              className={`${alert.level > 80 ? 'bg-primary' : 'bg-amber-500'} rounded-full h-2`} 
              style={{ width: `${alert.level}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Normal</span>
            <span>{alert.level}%</span>
          </div>
        </div>
      ))}
      
      <Button variant="outline" className="w-full bg-neutral text-gray-700">
        Ver Todas las Alertas
      </Button>
    </div>
  );
}
