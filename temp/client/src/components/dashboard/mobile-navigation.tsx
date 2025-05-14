import { Link, useLocation } from "wouter";
import { Home, Users, Activity, BarChart2, GraduationCap } from "lucide-react";

export function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { name: "Panel", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Pacientes", path: "/pacientes", icon: <Users className="h-5 w-5" /> },
    { name: "Condiciones", path: "/condiciones", icon: <Activity className="h-5 w-5" /> },
    { name: "Estadísticas", path: "/estadisticas", icon: <BarChart2 className="h-5 w-5" /> },
    { name: "Educación", path: "/educacion", icon: <GraduationCap className="h-5 w-5" /> }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}