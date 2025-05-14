import { Button } from "@/components/ui/button";
import { Brain, Eye, Heart } from "lucide-react";

export function EducationSection() {
  const educationalResources = [
    {
      id: 1,
      icon: <Brain className="h-5 w-5 text-secondary" />,
      title: "Impacto Neurológico",
    },
    {
      id: 2,
      icon: <Eye className="h-5 w-5 text-secondary" />,
      title: "Cuidado de la Visión",
    },
    {
      id: 3,
      icon: <Heart className="h-5 w-5 text-secondary" />,
      title: "Función Cardíaca",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
        Educación Clínica
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Materiales educativos para gestión de condiciones
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {educationalResources.map((resource) => (
          <div key={resource.id} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center mb-2">
              {resource.icon}
            </div>
            <span className="text-xs text-center">{resource.title}</span>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full bg-neutral text-gray-700">
        Ver Educación Clínica
      </Button>
    </div>
  );
}
