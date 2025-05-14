import { Button } from "@/components/ui/button";
import { Condition } from "@/lib/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ConditionCardProps {
  condition: Condition;
  isActive?: boolean;
}

export function ConditionCard({ condition, isActive = true }: ConditionCardProps) {
  // Function to get metrics by key or return a default
  const getMetricValue = (key: string, defaultValue: string = "N/A") => {
    const metric = condition.metrics.find(m => m.key === key);
    return metric ? metric.value : defaultValue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start">
        <div className="mr-4">
          <div className={`flex items-center justify-center w-6 h-6 ${isActive ? 'bg-accent bg-opacity-10' : 'bg-primary bg-opacity-10'} rounded-full`}>
            {isActive ? (
              <CheckCircle2 className="h-4 w-4 text-accent" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="font-semibold">{condition.name}</h3>
            <span className="ml-2 text-xs bg-neutral px-2 py-0.5 rounded">{condition.type}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
            {condition.metrics.map((metric, index) => (
              <div key={index}>
                <div className="text-xs text-gray-500">{metric.key}</div>
                <div className="flex items-end">
                  {metric.key === "A1C" || metric.key === "PA" ? (
                    <>
                      <span className="font-bold">{metric.key}:</span>
                      <span className="ml-1">{metric.value}</span>
                    </>
                  ) : (
                    <span>{metric.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              Ver Detalles Clínicos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Guía de Tratamiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
