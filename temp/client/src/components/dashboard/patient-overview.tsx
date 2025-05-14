import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  AlertTriangle, 
  ChevronRight, 
  Stethoscope, 
  Heart, 
  Download 
} from "lucide-react";
import { PatientProfile } from "@/lib/types";

interface PatientOverviewProps {
  patient: PatientProfile;
  doctorName: string;
  doctorInitials: string;
  doctorSpecialty: string;
  systemStatus: {
    label: string;
    value: number;
  };
}

export function PatientOverview({ 
  patient, 
  doctorName, 
  doctorInitials, 
  doctorSpecialty,
  systemStatus 
}: PatientOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Doctor Profile Card */}
      <Card className="bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="font-medium text-xl">{doctorInitials}</span>
          </div>
          <h2 className="text-lg font-semibold">{doctorName}</h2>
          <p className="text-sm text-gray-500">{doctorSpecialty}</p>
          
          <div className="w-full mt-4">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span>ESTADO DEL SISTEMA</span>
              <span className="text-accent">{systemStatus.label}</span>
            </div>
            <div className="bg-neutral rounded-full h-2 w-full">
              <div 
                className="bg-accent rounded-full h-2" 
                style={{ width: `${systemStatus.value}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
          
          <div className="w-full mt-4">
            <p className="text-xs text-gray-500 mb-2">Datos Riesgo</p>
            <Button className="bg-secondary text-white rounded-md py-2 px-4 w-full text-sm font-medium">
              Nuevo Paciente
            </Button>
          </div>
          
          <div className="w-full mt-4 border-t pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>Análisis de Tratamiento</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              <Stethoscope className="h-4 w-4" />
              <span>Asistente IA Diagnóstico</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Patient Info Card */}
      <Card className="bg-white p-6 lg:col-span-3">
        <div className="flex items-center">
          <div className="bg-secondary bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mr-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">{`${patient.nombre} ${patient.apellido}`}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span>{patient.edad} años</span>
              <span className="mx-2">•</span>
              <span>{patient.genero}</span>
            </div>
          </div>
        </div>
        
        {/* Condition Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Primary Diagnosis */}
          {patient.conditions.length > 0 && (
            <div className="bg-neutral p-4 rounded-lg border-l-4 border-secondary">
              <div className="flex items-center text-xs text-secondary font-medium mb-2">
                <Stethoscope className="h-3 w-3 mr-1" />
                <span>Diagnóstico Principal</span>
              </div>
              <h3 className="font-bold">{patient.conditions[0].name}</h3>
              <p className="text-sm text-gray-500">
                Actualizado: {new Date(patient.conditions[0].diagnosed_date).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* Secondary Condition */}
          {patient.conditions.length > 1 && (
            <div className="bg-neutral p-4 rounded-lg border-l-4 border-primary">
              <div className="flex items-center text-xs text-primary font-medium mb-2">
                <Heart className="h-3 w-3 mr-1" />
                <span>Condición Secundaria</span>
              </div>
              <h3 className="font-bold">{patient.conditions[1].name}</h3>
              <p className="text-sm text-gray-500">
                Actualizado: {new Date(patient.conditions[1].diagnosed_date).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* Risk Level */}
          <div className="bg-neutral p-4 rounded-lg border-l-4 border-amber-500">
            <div className="flex items-center text-xs text-amber-500 font-medium mb-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Nivel de Riesgo</span>
            </div>
            <h3 className="font-bold">Alto (76%)</h3>
            <p className="text-sm text-gray-500">Actualizado: 15/06/2023</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex mt-6 space-x-3">
          <Button className="flex-1 text-white bg-secondary flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Historial
          </Button>
        </div>
      </Card>
    </div>
  );
}
