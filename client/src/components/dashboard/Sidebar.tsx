import { Link } from "wouter";
import { Home, Users, Activity, BarChart } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs text-neutral-500 font-medium uppercase tracking-wider pl-3">
            Principal
          </h3>
          <div className="space-y-1">
            <Link href="/">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-900 hover:bg-neutral-100 font-medium">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/pacientes">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                <Users className="h-4 w-4" />
                <span>Pacientes</span>
              </a>
            </Link>
            <Link href="/condiciones">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                <Activity className="h-4 w-4" />
                <span>Condiciones</span>
              </a>
            </Link>
            <Link href="/estadisticas">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                <BarChart className="h-4 w-4" />
                <span>Estadísticas</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs text-neutral-500 font-medium uppercase tracking-wider pl-3">
            Recursos
          </h3>
          <div className="space-y-1">
            <Link href="#">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Artículos médicos</span>
              </a>
            </Link>
            <Link href="#">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Guías clínicas</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-700 mb-2">¿Necesitas ayuda?</h4>
          <p className="text-sm text-blue-600 mb-3">
            Consulta nuestra documentación o contacta a soporte.
          </p>
          <Link href="#">
            <a className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline">
              Ver recursos de ayuda →
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}