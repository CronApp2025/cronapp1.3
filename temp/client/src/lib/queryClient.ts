import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL para la API de Flask
// Usando una URL relativa para que funcione en cualquier entorno
// Importante: Aseguramos que usamos la misma URL del servidor Flask 
// independientemente de dónde se esté sirviendo el frontend
const API_BASE_URL = window.location.origin;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    try {
      // La API Flask normalmente devuelve errores en formato JSON con message
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.msg || res.statusText;
    } catch (e) {
      // Si no es JSON, usar el texto directamente
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    headers?: Record<string, string>;
  }
): Promise<Response> {
  // Añadir el token a los headers si existe
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {})
  };
  
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Asegurarse de que url comienza con /api
  const fullUrl = url.startsWith("/api") 
    ? `${API_BASE_URL}${url}` 
    : `${API_BASE_URL}/api${url.startsWith("/") ? url : `/${url}`}`;

  console.log(`Haciendo petición ${method} a ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    // Construir la URL completa para la API de Flask
    const fullUrl = url.startsWith("/api") 
      ? `${API_BASE_URL}${url}` 
      : `${API_BASE_URL}/api${url.startsWith("/") ? url : `/${url}`}`;
    
    // Añadir el token a los headers si existe
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    console.log(`Haciendo petición GET a ${fullUrl}`);

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    try {
      const data = await res.json();
      // La API devuelve data dentro de un objeto con success y message
      return data.data || data;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Error parsing server response");
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
