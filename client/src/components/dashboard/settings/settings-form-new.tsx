import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useToast } from "@/hooks/use-toast";

export function SettingsFormNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fecha_nacimiento: ""
  });

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.substring(0, 10) : ""
      });
    }
  }, [user]);

  if (!user) {
    return <LoadingScreen />;
  }

  const { updateUserInfo } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Obtener el token de autenticación
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró el token de autenticación. Por favor, inicia sesión nuevamente."
        });
        setIsLoading(false);
        return;
      }
      
      // Realizar la solicitud directamente con fetch
      console.log("Enviando datos de configuración:", formData);
      
      const response = await fetch(`${window.location.origin}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log("Estado de la respuesta:", response.status);
      
      const data = await response.json();
      console.log("Respuesta de la API:", data);
      
      if (data.success) {
        // Usar el método updateUserInfo para actualizar los datos del usuario en toda la aplicación
        updateUserInfo({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          fecha_nacimiento: formData.fecha_nacimiento
        });
        
        toast({
          title: "Éxito",
          description: "Configuración actualizada correctamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.msg || "No se pudo actualizar la configuración"
        });
      }
    } catch (error) {
      console.error('Error al actualizar settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la configuración"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}