import { useState, useEffect } from "react";
import { ChevronDown, FileText, Eye, Heart, Microscope, Activity, AlertTriangle, Search, Filter, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CONDITIONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Patient, Condition, Metric } from "@shared/schema";
import { formatDateString } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

// Componente para mostrar una métrica de condición
const ConditionMetric = ({ metric }: { metric: any }) => {
  const ValueIcon = metric.icon === 'microscope' ? Microscope : 
                  metric.icon === 'heart' ? Heart : Activity;
  
  const getTextColorClass = (color: string | undefined) => {
    if (!color) return "text-neutral-800";
    if (color === "warning") return "text-[#ff9800]";
    if (color === "danger") return "text-[#f44336]";
    return "text-primary";
  };
  
  return (
    <div className="bg-neutral-50 rounded-md p-4 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center mb-2">
        <ValueIcon className={`h-4 w-4 ${metric.icon === 'heart' ? 'text-[#f44336]' : 'text-primary'} mr-2`} />
        <h4 className="text-sm font-semibold text-neutral-700">{metric.name}</h4>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-600">{metric.label}</span>
        </div>
        <div>
          {metric.valueLabel && (
            <span className="text-sm text-neutral-600">{metric.valueLabel}</span>
          )}
          <span className={`text-lg font-semibold ${getTextColorClass(metric.valueColor)} font-mono ml-2`}>
            {metric.value}
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para una tarjeta de condición
const ConditionCard = ({ condition, onOpenDetails }: { condition: any, onOpenDetails: (condition: any) => void }) => {
  const ConditionIcon = condition.icon === 'heart' ? Heart : Activity;
  const colorClass = condition.color === 'red' ? '[#f44336]' : 'primary';
  const bgColorClass = condition.color === 'red' ? 'red-100' : 'blue-100';
  const borderColorClass = condition.color === 'red' ? '[#f44336]' : 'primary';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-b border-neutral-100 p-6`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex items-start">
          <div className={`w-10 h-10 bg-${bgColorClass} text-${colorClass} rounded-md flex items-center justify-center mr-4 flex-shrink-0`}>
            <ConditionIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">{condition.name}</h3>
            <p className="text-sm text-neutral-500">{condition.type}</p>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {condition.metrics.map((metric: any, index: number) => (
            <ConditionMetric key={index} metric={metric} />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
        <Button 
          variant="outline" 
          className={`px-4 py-2 border border-${borderColorClass} text-${colorClass} rounded-md flex items-center justify-center hover:bg-${condition.color === 'red' ? '[#ffebee]' : 'primary-50'}`}
          onClick={() => onOpenDetails(condition)}
        >
          <Eye className="h-4 w-4 mr-2" />
          <span>Ver Detalles Clínicos</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
        
        <Button 
          variant="secondary" 
          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md flex items-center justify-center hover:bg-neutral-200"
          onClick={() => {
            toast({
              title: "Guías de Tratamiento",
              description: `Guías para ${condition.name} descargadas correctamente.`,
            });
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span>Guías de Tratamiento</span>
        </Button>
      </div>
    </motion.div>
  );
};

// Componente de detalles de condición
const ConditionDetails = ({ condition, onClose }: { condition: any, onClose: () => void }) => {
  const ConditionIcon = condition.icon === 'heart' ? Heart : Activity;
  const colorClass = condition.color === 'red' ? '[#f44336]' : 'primary';
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className={`w-10 h-10 bg-${condition.color === 'red' ? 'red' : 'blue'}-100 text-${colorClass} rounded-md flex items-center justify-center mr-4`}>
          <ConditionIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-neutral-800">{condition.name}</h3>
          <p className="text-sm text-neutral-500">{condition.type}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
        {condition.metrics.map((metric: any, index: number) => (
          <div key={index} className="bg-neutral-50 p-4 rounded-md">
            <h4 className="font-semibold text-neutral-700 mb-2">{metric.name}</h4>
            <p className="text-sm text-neutral-600 mb-1">{metric.label}</p>
            <p className="text-lg font-semibold">{metric.value}</p>
            <p className="text-xs text-neutral-500 mt-2">
              Actualizado: {formatDateString(new Date().toISOString())}
            </p>
          </div>
        ))}
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-md mt-4">
        <h4 className="font-semibold text-neutral-700 mb-2">Recomendaciones de Tratamiento</h4>
        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
          <li>Seguimiento cada 3 meses con especialista</li>
          <li>Control diario de niveles según recomendaciones</li>
          <li>Evaluación de medicación actual</li>
          <li>Plan nutricional especializado</li>
        </ul>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          onClick={onClose} 
          variant="outline"
        >
          Cerrar
        </Button>
        <Button>Actualizar Tratamiento</Button>
      </div>
    </div>
  );
};

// Componente para añadir nueva condición
const AddConditionForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Nombre de la Condición
          </label>
          <Input placeholder="Ej. Diabetes Tipo 2" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Tipo de Condición
          </label>
          <Input placeholder="Ej. Gestión Clínica" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Nivel de Severidad
          </label>
          <Input placeholder="Ej. Moderado" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Notas del Tratamiento
          </label>
          <Input placeholder="Notas importantes sobre el tratamiento..." />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          onClick={onClose} 
          variant="outline"
        >
          Cancelar
        </Button>
        <Button onClick={() => {
          toast({
            title: "Condición Añadida",
            description: "La nueva condición se ha añadido correctamente.",
          });
          onClose();
        }}>
          Guardar Condición
        </Button>
      </div>
    </div>
  );
};

export function ConditionManagement() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConditions, setFilteredConditions] = useState<any[]>(CONDITIONS);
  const [selectedCondition, setSelectedCondition] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddConditionOpen, setIsAddConditionOpen] = useState(false);
  
  // Obtener las condiciones reales de la base de datos
  const { data: conditions = [] } = useQuery<Condition[]>({
    queryKey: ['/api/conditions'],
    queryFn: async () => {
      return await apiRequest('/api/conditions');
    }
  });
  
  // Filtra las condiciones según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConditions(CONDITIONS);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = CONDITIONS.filter((condition) => 
        condition.name.toLowerCase().includes(lowercasedSearch) || 
        condition.type.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredConditions(filtered);
    }
  }, [searchTerm]);
  
  // Manejador para abrir los detalles de una condición
  const handleOpenDetails = (condition: any) => {
    setSelectedCondition(condition);
    setIsDetailsOpen(true);
  };
  
  // Componente para el diálogo de detalles (responsivo)
  const DetailsDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Detalles de la Condición</DrawerTitle>
              <DrawerDescription>Información detallada y tratamiento recomendado</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {selectedCondition && (
                <ConditionDetails 
                  condition={selectedCondition} 
                  onClose={() => setIsDetailsOpen(false)} 
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Condición</DialogTitle>
            <DialogDescription>Información detallada y tratamiento recomendado</DialogDescription>
          </DialogHeader>
          {selectedCondition && (
            <ConditionDetails 
              condition={selectedCondition} 
              onClose={() => setIsDetailsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  // Componente para el diálogo de añadir condición (responsivo)
  const AddConditionDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={isAddConditionOpen} onOpenChange={setIsAddConditionOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Añadir Nueva Condición</DrawerTitle>
              <DrawerDescription>Ingrese los detalles de la nueva condición médica</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <AddConditionForm onClose={() => setIsAddConditionOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isAddConditionOpen} onOpenChange={setIsAddConditionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Nueva Condición</DialogTitle>
            <DialogDescription>Ingrese los detalles de la nueva condición médica</DialogDescription>
          </DialogHeader>
          <AddConditionForm onClose={() => setIsAddConditionOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">Gestor de Condiciones del Paciente</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Sistema interactivo de monitoreo y tratamiento de enfermedades
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-50 text-primary border-none">
              <Settings className="h-3 w-3 mr-1" />
              Herramientas
            </Badge>
            <Badge className="bg-[#e8f5e9] text-[#4caf50] border-none">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Monitoreo Activo
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input 
              type="text" 
              placeholder="Buscar condiciones..." 
              className="w-full pl-10 pr-4 py-2 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
          </div>
          <Button 
            variant="outline" 
            className="px-4 py-2 border border-neutral-200 rounded-md flex items-center text-neutral-700 hover:bg-neutral-50"
            onClick={() => toast({
              title: "Filtros",
              description: "Los filtros se han aplicado correctamente."
            })}
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filtros</span>
          </Button>
        </div>
      </div>
      
      {/* Lista de condiciones */}
      {filteredConditions.map((condition) => (
        <ConditionCard 
          key={condition.id} 
          condition={condition} 
          onOpenDetails={handleOpenDetails}
        />
      ))}
      
      <div className="p-6 border-t border-neutral-100 bg-neutral-50">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-neutral-600">
              Gestionando {filteredConditions.length} condiciones
              <span className="text-neutral-500 text-xs block sm:inline sm:ml-2">
                Última actualización: {formatDateString(new Date().toISOString())}
              </span>
            </p>
          </div>
          
          <Button 
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-600 w-full sm:w-auto"
            onClick={() => setIsAddConditionOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Nueva Condición</span>
          </Button>
        </div>
      </div>
      
      {/* Diálogos y drawers */}
      <DetailsDialog />
      <AddConditionDialog />
    </div>
  );
}

export default ConditionManagement;
