import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param birthDate Fecha de nacimiento en formato string o Date
 * @returns Edad en años
 */
export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato string ISO
 * @param format Formato deseado: 'short', 'medium', 'long'
 * @returns Fecha formateada
 */
export function formatDateString(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: format === 'short' ? '2-digit' : 'long',
      day: 'numeric'
    };
    
    if (format === 'long') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

/**
 * Convierte el nombre completo del usuario a iniciales
 * @param nombre Nombre del usuario
 * @param apellido Apellido del usuario
 * @returns Iniciales (por ejemplo, "JS" para "Juan Sánchez")
 */
export function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

/**
 * Obtiene el nombre completo formateado
 * @param nombre Nombre del usuario
 * @param apellido Apellido del usuario
 * @param prefix Prefijo opcional (Dr., Dra., etc.)
 * @returns Nombre completo formateado
 */
export function formatFullName(nombre: string, apellido: string, prefix?: string): string {
  if (prefix) {
    return `${prefix} ${nombre} ${apellido}`;
  }
  return `${nombre} ${apellido}`;
}
