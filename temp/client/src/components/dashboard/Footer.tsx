import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 py-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Healthcare Dashboard. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">
              Términos de servicio
            </a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">
              Política de privacidad
            </a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center">
              <span>Documentación</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}