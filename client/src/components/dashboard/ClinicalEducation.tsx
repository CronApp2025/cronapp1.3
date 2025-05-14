import React, { useState } from "react";
import { 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Eye, 
  Heart, 
  BookOpenCheck, 
  FileText, 
  DownloadCloud, 
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDUCATIONAL_RESOURCES } from "@/lib/constants";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription 
} from "@/components/ui/drawer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { useEducationalResources } from "@/hooks/use-patient";

// Obtener el icono correcto basado en el tipo
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'brain':
      return Brain;
    case 'heart':
      return Heart;
    case 'eye':
      return Eye;
    case 'lungs':
      return Activity;
    case 'zap':
      return Zap;
    default:
      return BookOpen;
  }
};

// Componente para cada recurso educativo
const EducationalResourceItem = ({ 
  resource, 
  onClick 
}: { 
  resource: any, 
  onClick: (resource: any) => void 
}) => {
  const IconComponent = getIconComponent(resource.icon);
  const colorClass = resource.color === 'danger' ? 'text-[#f44336]' : 'text-primary';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.2 }}
      className="text-center cursor-pointer"
      onClick={() => onClick(resource)}
    >
      <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-3 flex items-center justify-center hover:shadow-md transition-all duration-200">
        <IconComponent className={`h-7 w-7 ${colorClass}`} />
      </div>
      <p className="text-xs text-neutral-700 font-medium">{resource.name}</p>
    </motion.div>
  );
};

// Lista de recursos educativos para cada categoría
const resourceCatalog = {
  brain: [
    {
      id: 1,
      title: "Impacto de la Diabetes en el Cerebro",
      description: "Investigación sobre la conexión entre diabetes y deterioro cognitivo.",
      type: "Artículo",
      date: "15 Mar 2025",
      new: true
    },
    {
      id: 2,
      title: "Neuropatía y Diabetes: Guía Completa",
      description: "Manual para pacientes y médicos sobre el manejo de complicaciones neurológicas.",
      type: "Guía",
      date: "28 Feb 2025"
    },
    {
      id: 3,
      title: "Casos Clínicos: Deterioro Cognitivo en Pacientes Diabéticos",
      description: "Presentación de casos relevantes para la práctica médica.",
      type: "Casos Clínicos",
      date: "10 Ene 2025"
    }
  ],
  eye: [
    {
      id: 1,
      title: "Retinopatía Diabética: Detección Temprana",
      description: "Protocolos para la evaluación y seguimiento oftalmológico en pacientes diabéticos.",
      type: "Protocolo",
      date: "22 Mar 2025",
      new: true
    },
    {
      id: 2,
      title: "Avances en Tratamiento Láser para Retinopatía",
      description: "Nuevas técnicas y resultados clínicos.",
      type: "Investigación",
      date: "17 Feb 2025"
    }
  ],
  heart: [
    {
      id: 1,
      title: "Cardiomiopatía Hipertensiva: Evaluación y Tratamiento",
      description: "Guía actualizada para el manejo cardiológico en pacientes hipertensos.",
      type: "Guía Clínica",
      date: "05 Abr 2025",
      new: true
    },
    {
      id: 2,
      title: "Hipertensión y Riesgo de ACV: Prevención",
      description: "Estrategias preventivas basadas en evidencia.",
      type: "Manual",
      date: "11 Mar 2025"
    },
    {
      id: 3,
      title: "Nuevos Anticoagulantes en Pacientes Hipertensos",
      description: "Actualización sobre uso, beneficios y precauciones.",
      type: "Actualización",
      date: "25 Feb 2025"
    }
  ],
  lungs: [
    {
      id: 1,
      title: "EPOC y Comorbilidades Metabólicas",
      description: "Manejo integral de pacientes con enfermedad pulmonar y diabetes.",
      type: "Artículo",
      date: "18 Mar 2025"
    },
    {
      id: 2,
      title: "Función Pulmonar en Pacientes Diabéticos",
      description: "Evaluación y seguimiento recomendado.",
      type: "Guía",
      date: "02 Feb 2025"
    }
  ],
  zap: [
    {
      id: 1,
      title: "Neuropatía Diabética: Dolor y Manejo",
      description: "Actualización en tratamientos para el dolor neuropático.",
      type: "Protocolo",
      date: "27 Mar 2025",
      new: true
    },
    {
      id: 2,
      title: "Estimulación Nerviosa en Diabetes Avanzada",
      description: "Nuevas técnicas de neuromodulación para complicaciones diabéticas.",
      type: "Investigación",
      date: "14 Feb 2025"
    }
  ]
};

// Componente para mostrar detalles del recurso
const ResourceDetails = ({ 
  category, 
  onClose 
}: { 
  category: string, 
  onClose: () => void 
}) => {
  const resources = resourceCatalog[category as keyof typeof resourceCatalog] || [];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{resource.title}</CardTitle>
                {'new' in resource && resource.new && (
                  <Badge className="bg-green-100 text-green-600 hover:bg-green-200">Nuevo</Badge>
                )}
              </div>
              <CardDescription>
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenCheck className="h-3.5 w-3.5 text-neutral-500 mr-1" />
                <span className="text-xs text-neutral-500">{resource.type}</span>
                <span className="mx-2 text-neutral-300">•</span>
                <span className="text-xs text-neutral-500">{resource.date}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8"
                onClick={() => {
                  toast({
                    title: "Recurso Descargado",
                    description: `Se ha descargado "${resource.title}"`,
                  });
                }}
              >
                <DownloadCloud className="h-3.5 w-3.5 mr-1" />
                <span>Descargar</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onClose} variant="outline">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export function ClinicalEducation() {
  const isMobile = useIsMobile();
  const [resources, setResources] = useState(EDUCATIONAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Obtener recursos educativos desde el hook (cuando sea implementado)
  const { data: educationalResources = [] } = useEducationalResources();
  
  // Función para manejar el clic en un recurso
  const handleResourceClick = (resource: any) => {
    setSelectedCategory(resource.icon);
    setIsResourcesOpen(true);
  };
  
  // Componente para la biblioteca de recursos (responsivo)
  const ResourceLibraryDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Recursos Educativos</DrawerTitle>
              <DrawerDescription>Artículos y guías clínicas disponibles</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <ResourceDetails 
                category={selectedCategory} 
                onClose={() => setIsResourcesOpen(false)} 
              />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Recursos Educativos</DialogTitle>
            <DialogDescription>Artículos y guías clínicas disponibles</DialogDescription>
          </DialogHeader>
          <ResourceDetails 
            category={selectedCategory} 
            onClose={() => setIsResourcesOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    );
  };
  
  // Componente para el catálogo completo (responsivo)
  const FullCatalogDialog = () => {
    // Lista completa de categorías
    const allCategories = [
      { icon: "brain", name: "Neurología" },
      { icon: "heart", name: "Cardiología", color: "danger" },
      { icon: "eye", name: "Oftalmología" },
      { icon: "lungs", name: "Neumología" },
      { icon: "zap", name: "Dolor y Neuropatía" }
    ];
    
    if (isMobile) {
      return (
        <Drawer open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Biblioteca Clínica Completa</DrawerTitle>
              <DrawerDescription>Todos los recursos educativos disponibles</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                {allCategories.map((resource, index) => (
                  <EducationalResourceItem 
                    key={index} 
                    resource={resource} 
                    onClick={(r) => {
                      setSelectedCategory(r.icon);
                      setIsResourcesOpen(true);
                      setIsCatalogOpen(false);
                    }} 
                  />
                ))}
              </div>
              <Button onClick={() => setIsCatalogOpen(false)} variant="outline" className="w-full">
                Cerrar
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Biblioteca Clínica Completa</DialogTitle>
            <DialogDescription>Todos los recursos educativos disponibles</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 py-4">
            {allCategories.map((resource, index) => (
              <EducationalResourceItem 
                key={index} 
                resource={resource} 
                onClick={(r) => {
                  setSelectedCategory(r.icon);
                  setIsResourcesOpen(true);
                  setIsCatalogOpen(false);
                }} 
              />
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsCatalogOpen(false)} variant="outline">
              Cerrar
            </Button>
          </div>
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
      <div className="flex items-start mb-6">
        <div className="w-8 h-8 bg-primary-100 text-primary rounded-md flex items-center justify-center mr-3">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Educación Clínica</h3>
          <p className="text-sm text-neutral-500">Recursos clínicos sobre gestión de condiciones</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {resources.map((resource, index) => (
          <EducationalResourceItem 
            key={index} 
            resource={resource} 
            onClick={handleResourceClick} 
          />
        ))}
      </div>
      
      <Button 
        variant="secondary" 
        className="w-full py-2 px-4 bg-primary-50 text-primary hover:bg-primary-100 rounded-md flex items-center justify-center mt-2"
        onClick={() => setIsCatalogOpen(true)}
      >
        <span>Ver Biblioteca Clínica</span>
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
      
      <ResourceLibraryDialog />
      <FullCatalogDialog />
    </motion.div>
  );
}