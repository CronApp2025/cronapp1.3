import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 shadow-lg flex flex-col items-center max-w-md w-full">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">{message}</h2>
        <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
          <div 
            className="bg-primary h-full animate-pulse" 
            style={{ width: '100%' }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Estamos preparando todo para ti...
        </p>
      </div>
    </div>
  );
}