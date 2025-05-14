import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  new_password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  confirm_password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden.",
  path: ["confirm_password"],
});

export function ResetPasswordForm({ token }: { token: string }) {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  // Verificar que tenemos un token
  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Error de token</h3>
        <p className="text-red-700 text-sm mt-1">
          No se encontró un token válido. Por favor, solicita un nuevo enlace de recuperación.
        </p>
        <div className="mt-4">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Volver a solicitar recuperación
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading || resetSuccess) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Enviando solicitud de restablecimiento de contraseña con token:", token);
      
      // Llamar directamente al endpoint de reseteo de contraseña
      const response = await fetch(`${window.location.origin}/api/recover/resetear_password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: values.new_password
        })
      });
      
      const data = await response.json();
      console.log("Respuesta del API de reseteo:", data);
      
      if (!response.ok) {
        throw new Error(data.msg || data.message || "Error al restablecer la contraseña");
      }
      
      // Mostrar mensaje de éxito
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente",
      });
      
      setResetSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error: any) {
      console.error("Error al resetear contraseña:", error);
      setError(error.message || "No se pudo actualizar la contraseña. El enlace puede ser inválido o haber expirado.");
      
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña. Verifica que el enlace sea válido y no haya expirado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-[90%] sm:max-w-md mx-auto">
      <div className="flex flex-col items-center mb-4">
        <img src="/images/logo.png" alt="Logo" className="h-16 w-16 mb-2" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Restablecer contraseña</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Crea una nueva contraseña segura</p>
      </div>
      {resetSuccess && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-md">
          <h3 className="text-green-800 font-medium mb-1">¡Contraseña actualizada!</h3>
          <p className="text-green-700 text-sm">
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión en unos segundos.
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="text-red-800 font-medium mb-1">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...field}
                      disabled={resetSuccess}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={resetSuccess}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...field}
                      disabled={resetSuccess}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={resetSuccess}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`w-full ${resetSuccess ? 'bg-green-500' : 'bg-primary'} text-white`}
            disabled={isLoading || resetSuccess}
          >
            {isLoading ? "Actualizando..." : 
             resetSuccess ? "¡Contraseña actualizada!" : 
             "Actualizar contraseña"}
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
