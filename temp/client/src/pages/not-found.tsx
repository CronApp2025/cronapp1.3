import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Página no encontrada</h2>
        <p className="text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button className="bg-primary text-white">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}