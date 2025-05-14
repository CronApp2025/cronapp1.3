import { Button } from "@/components/ui/button";
import { ClinicalAssistantMessage } from "@/lib/types";
import { FlaskRound, Info, Bot } from "lucide-react";

interface ClinicalAssistantProps {
  messages: ClinicalAssistantMessage[];
}

export function ClinicalAssistant({ messages }: ClinicalAssistantProps) {
  // Function to render the appropriate icon for each message
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "info-circle":
        return <Info className="h-5 w-5 text-secondary" />;
      case "flask":
        return <FlaskRound className="h-5 w-5 text-secondary" />;
      default:
        return <Info className="h-5 w-5 text-secondary" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-bold flex items-center mb-4">
        <Bot className="h-5 w-5 text-secondary mr-2" />
        Asistente Clínico IA
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Recomendaciones del tratamiento basado en IA
      </p>
      
      {/* Assistant Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start">
            <div className="mr-3 text-secondary">
              {renderIcon(message.icon)}
            </div>
            <div>
              <p className="text-sm">{message.message}</p>
              <div className="flex space-x-2 mt-2">
                <Button 
                  size="sm" 
                  className="text-xs bg-secondary text-white"
                >
                  {message.actions.primary}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-neutral text-gray-700"
                >
                  {message.actions.secondary}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t mt-6 pt-4 flex justify-end space-x-3 text-sm">
        <Button variant="ghost" size="sm" className="text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Analizar resultados
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Ajustar tratamiento
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Testimonio IA
        </Button>
      </div>
    </div>
  );
}
