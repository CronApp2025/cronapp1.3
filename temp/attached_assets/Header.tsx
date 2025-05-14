import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  activePath: string;
}

export const Header = ({ activePath }: HeaderProps) => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const tabs = [
    { label: "Panel", path: "/" },
    { label: "Pacientes", path: "/pacientes" },
    { label: "Tratamientos", path: "/tratamientos" },
    { label: "Estadísticas", path: "/estadisticas" },
  ];

  return (
    <>


      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <a href="#" className="flex items-center text-primary font-bold text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  <path d="M3.5 12h8"></path>
                  <path d="M12.5 3v8"></path>
                  <path d="M12.5 19v2"></path>
                  <path d="M20.5 12h-8"></path>
                </svg>
                <span>CronApp</span>
              </a>

              {!isMobile && (
                <nav className="hidden md:flex space-x-1">
                  {tabs.map((tab) => (
                    <a
                      key={tab.path}
                      href={tab.path}
                      className={`px-4 py-4 font-medium ${
                        activePath === tab.path
                          ? "text-primary border-b-2 border-primary"
                          : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                      }`}
                    >
                      {tab.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!isMobile && (
                <div className="relative hidden md:block">
                  <Input 
                    type="text" 
                    placeholder="Buscar pacientes..." 
                    className="w-64 pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                </div>
              )}

              <div className="relative">
                <Button variant="ghost" size="icon" className="relative text-neutral-600 hover:bg-neutral-100 rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#f44336] rounded-full"></span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-neutral-800">Dr. Silva</div>
                  <div className="text-xs text-neutral-500">Especialista</div>
                </div>
                <Avatar className="bg-primary-400 text-white">
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
              </div>

              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileMenu}
                  className="md:hidden text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {isMobile && isMobileMenuOpen && (
            <nav className="md:hidden pt-2 pb-4">
              <div className="relative mb-4">
                <Input 
                  type="text" 
                  placeholder="Buscar pacientes..." 
                  className="w-full pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              </div>
              <div className="flex flex-col space-y-1">
                {tabs.map((tab) => (
                  <a
                    key={tab.path}
                    href={tab.path}
                    className={`px-4 py-3 font-medium rounded-md ${
                      activePath === tab.path
                        ? "bg-primary-50 text-primary"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {tab.label}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
      
      {isMobile && isMobileMenuOpen && (
        <div 
          className="overlay active" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
