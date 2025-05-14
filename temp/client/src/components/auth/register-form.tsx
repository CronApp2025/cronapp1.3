import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  apellido: z.string().min(3, {
    message: "El apellido debe tener al menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  fecha_nacimiento: z.string().refine(date => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  }, {
    message: "La fecha debe tener formato YYYY-MM-DD",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
  confirmarPassword: z.string().min(6, {
    message: "La confirmación de contraseña debe tener al menos 6 caracteres.",
  })
}).refine((data) => data.password === data.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

export function RegisterForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      fecha_nacimiento: "",
      password: "",
      confirmarPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      console.log("Enviando solicitud de registro:", values);
      
      // Registramos el usuario usando la API de Flask (con barra al final)
      const registerResponse = await apiRequest("POST", "/api/register/", {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        fecha_nacimiento: values.fecha_nacimiento,
        password: values.password
      });

      const registerData = await registerResponse.json();
      console.log("Respuesta de registro:", registerData);
      
      // Verificamos si el registro fue exitoso - soporta múltiples formatos de respuesta
      if (registerData.success || registerData.status === "success") {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente. Por favor, inicia sesión con tu correo.",
        });
        
        navigate("/login");
      } else {
        // El registro falló
        toast({
          title: "Error en el registro",
          description: registerData.message || registerData.msg || "Ha ocurrido un error al crear la cuenta",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al crear la cuenta",
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
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Crear cuenta</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Únete a la plataforma de salud digital</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* Nombre Input */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="Tu nombre"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellido Input */}
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="Tu apellido"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Input */}
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

          {/* Fecha Nacimiento Input */}
          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <Input
                      type="date"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="text-xs text-muted-foreground mt-1">
                  Formato: AAAA-MM-DD (Ejemplo: 1990-01-15)
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
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
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
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

          {/* Confirm Password Input */}
          <FormField
            control={form.control}
            name="confirmarPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
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
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-white"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>

          <div className="mt-2 text-center text-sm text-gray-500">
            Nota: Después de registrarte, inicia sesión usando tu correo y contraseña.
          </div>
          
          {/* Login Link */}
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}