import {
  Brain,
  ChevronDown,
  LineChart,
  Plus,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn("lg:w-80 bg-white rounded-lg shadow-sm p-6", className)}>
      {/* Doctor Profile */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 flex items-center justify-center mb-4">
          <span className="text-white text-lg font-medium">Dr. Silva</span>
        </div>
        <h2 className="text-lg font-semibold text-neutral-800">Dr. Silva</h2>
        <p className="text-sm text-neutral-500">Especialista • Endocrinología</p>

        <div className="flex items-center mt-2 text-xs text-neutral-500">
          <span className="w-2 h-2 bg-[#4caf50] rounded-full mr-1"></span>
          <span>Online</span>
          <span className="mx-2">•</span>
          <span>Acceso Médico Avanzado</span>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-neutral-500">ESTADO DEL SISTEMA</h3>
          <span className="text-xs text-[#4caf50]">ÓPTIMO</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-neutral-50 rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-neutral-800">24</div>
            <div className="text-xs text-neutral-500">Pacientes Activos</div>
          </div>
          <div className="bg-neutral-50 rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-[#ff9800]">3</div>
            <div className="text-xs text-neutral-500">Alertas Críticas</div>
          </div>
        </div>
      </div>

      {/* Data Wings */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-neutral-500">Data Wings</h3>
          <Button variant="outline" size="sm" className="text-xs text-primary border-primary-200 rounded h-7 px-2 py-1">
            <span>Expandir</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>

        <div className="bg-neutral-50 rounded-md p-3">
          <p className="text-sm text-neutral-600">
            Despliegue de wings para acceso de emergencia a datos vitales del paciente y herramientas quirúrgicas
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-md flex items-center justify-center">
          <Plus className="mr-2 h-4 w-4" />
          <span>Nuevo Paciente</span>
        </Button>

        <Button variant="outline" className="w-full py-3 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md flex items-center justify-center">
          <LineChart className="mr-2 h-4 w-4" />
          <span>Análisis de Tratamiento</span>
        </Button>

        <Button variant="outline" className="w-full py-3 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md flex items-center justify-center">
          <Bot className="mr-2 h-4 w-4" />
          <span>Asistente de Diagnóstico IA</span>
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
