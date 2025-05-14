import { CheckCircle, Database, Wifi } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 bg-white border-t border-neutral-100 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
          <div className="mb-4 md:mb-0">
            © 2025 CronApp • Desarrollado por CITT DuocUC • Versión 3.5.7
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="hover:text-primary">Términos de Servicio</a>
            <a href="#" className="hover:text-primary">Política de Privacidad</a>
            <a href="#" className="hover:text-primary">Soporte Técnico</a>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="mr-4 flex items-center">
              <CheckCircle className="h-3 w-3 text-[#4caf50] mr-1" />
              Sistema Óptimo
            </span>
            <span className="mr-4 flex items-center">
              <Database className="h-3 w-3 text-primary mr-1" />
              Datos Sincronizados
            </span>
            <span className="flex items-center">
              <Wifi className="h-3 w-3 text-[#4caf50] mr-1" />
              IA Activa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
