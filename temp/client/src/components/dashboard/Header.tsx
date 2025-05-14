import { Link } from "wouter";
import { Bell, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { calculateAge, getInitials, formatFullName } from "@/lib/utils";

interface HeaderProps {
  activePath?: string;
}

export const Header = ({ activePath = "/" }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-neutral-200 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="CronApp Logo" className="h-8 w-8" />
            <h1 className="hidden md:block text-xl font-semibold text-neutral-800 ml-2">CronApp</h1>
          </div>

          <nav className="hidden md:flex space-x-6 pl-6">
            <Link href="/" className={`text-sm font-medium ${activePath === "/" ? "text-primary" : "text-neutral-600 hover:text-neutral-900"}`}>
              Dashboard
            </Link>
            <Link href="/pacientes" className={`text-sm font-medium ${activePath === "/pacientes" ? "text-primary" : "text-neutral-600 hover:text-neutral-900"}`}>
              Pacientes
            </Link>
            <Link href="/condiciones" className={`text-sm font-medium ${activePath === "/condiciones" ? "text-primary" : "text-neutral-600 hover:text-neutral-900"}`}>
              Condiciones
            </Link>
            <Link href="/estadisticas" className={`text-sm font-medium ${activePath === "/estadisticas" ? "text-primary" : "text-neutral-600 hover:text-neutral-900"}`}>
              Estadísticas
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-neutral-600 hover:text-neutral-900 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button onClick={toggleDropdown} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                {user && getInitials(user.nombre, user.apellido)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-neutral-800">
                  {user && formatFullName(user.nombre, user.apellido, "Dr.")}
                </p>
                <p className="text-xs text-neutral-500">Médico</p>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-10">
                <div className="p-3 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-800">
                    {user && formatFullName(user.nombre, user.apellido, "Dr.")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user?.email}
                  </p>
                </div>
                <div className="p-2">
                  <Link href="/settings">
                    <a className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </a>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-neutral-100 rounded-md flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};