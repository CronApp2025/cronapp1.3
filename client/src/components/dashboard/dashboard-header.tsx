import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";

export function DashboardHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getFullName = (nombre: string, apellido: string) => {
    return `Dr. ${nombre.split(" ")[0]}`;
  };

  const navItems = [
    { name: "Panel", path: "/dashboard" },
    { name: "Pacientes", path: "/patients" },
    { name: "Tratamientos", path: "/treatments" },
    { name: "Estadísticas", path: "/statistics" },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="ml-6 flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`${
                      location === item.path
                        ? "border-b-2 border-primary text-primary"
                        : "border-transparent border-b-2 hover:border-gray-300 text-gray-500 hover:text-gray-700"
                    } px-1 py-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Search and Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {!isMobile && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="bg-neutral pl-10 pr-4 py-2 text-sm w-64"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Doctor Profile */}
            <div className="flex items-center">
              <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center">
                <span className="font-medium text-sm">
                  {user ? getInitials(user.nombre, user.apellido) : "DS"}
                </span>
              </div>
              {!isMobile && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.nombre ? getFullName(user.nombre, user.apellido) : "Médico"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}