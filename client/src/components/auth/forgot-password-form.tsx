import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
});

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await forgotPassword({
        email: values.email,
      });
      
      console.log("Resultado de recuperación:", result);
      
      // Validamos que result exista y tenga la estructura esperada
      if (result && typeof result === 'object') {
        console.log("Procesando resultado:", result);
        
        // Verificamos si la solicitud fue exitosa
        if ((result.status === "success") || 
            (result.data && result.data.token) || 
            ('success' in result && result.success)) {
          
          // Mostrar el mensaje de éxito y actualizar el estado
          setSuccessMessage(true);
          
          toast({
            title: "Solicitud enviada",
            description: "Revisa tu correo para instrucciones de recuperación",
          });
        } else {
          // En caso de error mostramos un mensaje
          console.warn("Formato de respuesta inesperado:", result);
          
          toast({
            title: "Error al generar enlace",
            description: "No se pudo procesar la solicitud correctamente.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      
      toast({
        title: "Error al generar enlace",
        description: "No se pudo procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (successMessage) {
    return (
      <div className="w-full max-w-[90%] sm:max-w-md mx-auto">
        <Card className="border-2 border-green-100">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <img src="/images/logo.png" alt="Logo" className="h-16 w-16" />
            </div>
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertTitle className="text-green-700 font-semibold">¡Solicitud enviada!</AlertTitle>
              <AlertDescription className="text-green-600">
                Hemos enviado un correo electrónico con las instrucciones para restablecer tu contraseña.
                <div className="mt-1 text-sm text-green-700 font-medium">
                  Si no lo recibes en unos minutos, revisa tu carpeta de spam.
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button
                className="w-full flex items-center justify-center gap-2 mt-4"
                variant="outline"
                onClick={() => window.location.href = "/login"}
              >
                Volver al inicio de sesión <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-[90%] sm:max-w-md mx-auto">
      <div className="flex flex-col items-center mb-4">
        <img src="/images/logo.png" alt="Logo" className="h-16 w-16 mb-2" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Te enviaremos instrucciones por correo electrónico</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="ejemplo@correo.com"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary text-white"
            disabled={isLoading}
          >
            {isLoading ? "Generando enlace..." : "Generar enlace de recuperación"}
          </Button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-secondary hover:underline text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
