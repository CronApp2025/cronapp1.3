export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_nacimiento: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  new_password: string;
}

export interface GoogleLoginData {
  email: string;
  nombre: string;
  apellido?: string;
  google_id?: string;
  fecha_nacimiento?: string;
  profile_picture?: string;
}

export interface Condition {
  id: number;
  name: string;
  type: string;
  diagnosed_date: string;
  metrics: Metric[];
  icon?: string;
  color?: string;
  lastUpdated?: string;
}

export interface Metric {
  id: number;
  key: string;
  value: string;
  date_recorded: string;
  name?: string;
  label?: string;
  icon?: string;
  valueColor?: string | null;
}

export interface PatientProfile {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
  fecha_nacimiento: string;
  conditions: Condition[];
}

export interface Alert {
  id: number;
  patientId: string;
  description: string;
  level: number;
  days: number;
  alertType?: string;
  time?: string;
  riskLevel?: number;
  riskColor?: string;
}

export interface EducationalResource {
  id: number;
  name: string;
  icon: string;
  category: string;
  color: string;
  url?: string;
  description?: string;
}

export interface ClinicalAssistantMessage {
  id: number;
  icon: string;
  message: string;
  actions: {
    primary: string;
    secondary: string;
  };
}

export interface Patient {
  id: number;
  fullName: string; // nombre + apellido
  age: number;
  gender: string;
  status: string;
  fecha_nacimiento: string;
  conditions: Array<{
    id: number;
    name: string;
    icon: string;
    lastUpdated: string;
  }>;
}