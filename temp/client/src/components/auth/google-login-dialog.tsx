import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GoogleLoginData } from "@/lib/types";

const googleUserSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  apellido: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
});

type GoogleUserFormData = z.infer<typeof googleUserSchema>;

interface GoogleLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoogleLoginData) => void;
}

export function GoogleLoginDialog({ isOpen, onClose, onSubmit }: GoogleLoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GoogleUserFormData>({
    resolver: zodResolver(googleUserSchema),
    defaultValues: {
      email: "",
      nombre: "",
      apellido: "",
    },
  });

  const handleSubmit = async (values: GoogleUserFormData) => {
    setIsLoading(true);
    try {
      const googleData: GoogleLoginData = {
        ...values,
        google_id: `google-${Math.random().toString(36).substring(2, 15)}`,
      };
      
      await onSubmit(googleData);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error en simulación de Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Simulación de Inicio de Sesión con Google
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Procesando..." : "Iniciar Sesión"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}