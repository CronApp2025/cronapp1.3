import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleLogin } from "@react-oauth/google";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
});

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();

        await loginWithGoogle({
          email: userInfo.email,
          nombre: userInfo.given_name || "",
          apellido: userInfo.family_name || "",
          google_id: userInfo.sub || "",
          profile_picture: userInfo.picture || "",
        });
      } catch (error) {
        console.error(
          "Error al procesar el inicio de sesión con Google:",
          error
        );
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google login failed:", errorResponse);
      setIsGoogleLoading(false);
    },
    onNonOAuthError: () => {
      console.log("Ventana de autenticación de Google cerrada por el usuario");
      setIsGoogleLoading(false);
    },
  });

  useEffect(() => {
    return () => {
      if (isGoogleLoading) {
        setIsGoogleLoading(false);
      }
    };
  }, [isGoogleLoading]);

  const handleGoogleLogin = () => {
    try {
      setIsGoogleLoading(true);
      googleLogin();

      setTimeout(() => {
        setIsGoogleLoading(false);
      }, 60000);
    } catch (error) {
      console.error("Error al iniciar el proceso de Google:", error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-[90%] sm:max-w-md mx-auto">
      <div className="flex flex-col items-center mb-4">
        <img src="/images/logo.png" alt="Logo" className="h-16 w-16 mb-2" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Accede a tu cuenta</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
            )}
            <span>{isGoogleLoading ? "Procesando..." : "Ingresar con Google"}</span>
          </Button>

          {/* Divisor mejorado con límites correctos */}
          <div className="py-3 flex items-center justify-center gap-3 my-2">
            <div className="h-px bg-gray-300 flex-1 max-w-[80px]"></div>
            <span className="text-sm text-gray-500">o continúa con</span>
            <div className="h-px bg-gray-300 flex-1 max-w-[80px]"></div>
          </div>

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

          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Contraseña</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-secondary hover:underline"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>
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

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-white"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>

          {/* Register Link */}
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}