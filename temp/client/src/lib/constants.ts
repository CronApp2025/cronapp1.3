import { Alert, Condition, EducationalResource, Patient } from "@/lib/types";

// Alertas de riesgo para pruebas
export const RISK_ALERTS: Alert[] = [
  {
    id: 1,
    patientId: "1",
    description: "Presión arterial elevada durante 3 días consecutivos",
    level: 3,
    days: 3,
    alertType: "critical",
    time: "10:30 AM",
    riskLevel: 85,
    riskColor: "#EF4444"
  },
  {
    id: 2,
    patientId: "1",
    description: "Nivel de glucosa fuera de rango objetivo",
    level: 2,
    days: 1,
    alertType: "warning",
    time: "02:45 PM",
    riskLevel: 65,
    riskColor: "#F97316"
  },
  {
    id: 3,
    patientId: "2",
    description: "Peso disminuyendo por debajo del umbral recomendado",
    level: 2,
    days: 5,
    alertType: "warning",
    time: "01:15 PM",
    riskLevel: 60,
    riskColor: "#F97316"
  },
  {
    id: 4,
    patientId: "3",
    description: "No ha reportado mediciones en los últimos 5 días",
    level: 1,
    days: 5,
    alertType: "notice",
    time: "09:10 AM",
    riskLevel: 40,
    riskColor: "#3B82F6"
  }
];

// Condiciones médicas para pruebas
export const CONDITIONS: Condition[] = [
  {
    id: 1,
    name: "Hipertensión",
    type: "chronic",
    diagnosed_date: "2022-05-15",
    metrics: [
      {
        id: 1,
        key: "systolic",
        name: "Sistólica",
        value: "145",
        date_recorded: "2023-11-01",
        label: "mmHg",
        valueColor: "#EF4444"
      },
      {
        id: 2,
        key: "diastolic",
        name: "Diastólica",
        value: "92",
        date_recorded: "2023-11-01",
        label: "mmHg",
        valueColor: "#F97316"
      },
      {
        id: 3,
        key: "heart_rate",
        name: "Pulso",
        value: "78",
        date_recorded: "2023-11-01",
        label: "bpm",
        valueColor: null
      }
    ],
    icon: "heart-pulse",
    color: "#EF4444",
    lastUpdated: "2023-11-01T10:30:00Z"
  },
  {
    id: 2,
    name: "Diabetes Tipo 2",
    type: "chronic",
    diagnosed_date: "2021-03-22",
    metrics: [
      {
        id: 4,
        key: "glucose",
        name: "Glucosa",
        value: "162",
        date_recorded: "2023-11-02",
        label: "mg/dL",
        valueColor: "#F97316"
      },
      {
        id: 5,
        key: "hba1c",
        name: "HbA1c",
        value: "7.2",
        date_recorded: "2023-10-01",
        label: "%",
        valueColor: "#F97316"
      },
      {
        id: 6,
        key: "weight",
        name: "Peso",
        value: "78",
        date_recorded: "2023-11-01",
        label: "kg",
        valueColor: null
      }
    ],
    icon: "droplet",
    color: "#3B82F6",
    lastUpdated: "2023-11-02T14:45:00Z"
  },
  {
    id: 3,
    name: "Asma",
    type: "chronic",
    diagnosed_date: "2019-08-15",
    metrics: [
      {
        id: 7,
        key: "peak_flow",
        name: "Flujo máximo",
        value: "380",
        date_recorded: "2023-10-31",
        label: "L/min",
        valueColor: null
      },
      {
        id: 8,
        key: "symptoms",
        name: "Síntomas",
        value: "Leves",
        date_recorded: "2023-10-31",
        label: "",
        valueColor: "#22C55E"
      }
    ],
    icon: "lungs",
    color: "#22C55E",
    lastUpdated: "2023-10-31T08:15:00Z"
  }
];

// Recursos educativos para pruebas
export const EDUCATIONAL_RESOURCES: EducationalResource[] = [
  {
    id: 1,
    name: "Guía de Hipertensión",
    icon: "heart-pulse",
    category: "cardiovascular",
    color: "#EF4444",
    url: "/resources/hypertension-guide.pdf",
    description: "Guía completa para entender y manejar la hipertensión arterial."
  },
  {
    id: 2,
    name: "Control de Glucosa",
    icon: "droplet",
    category: "diabetes",
    color: "#3B82F6",
    url: "/resources/glucose-control.pdf",
    description: "Consejos prácticos para monitorear y controlar los niveles de glucosa."
  },
  {
    id: 3,
    name: "Ejercicios Respiratorios",
    icon: "lungs",
    category: "respiratory",
    color: "#22C55E",
    url: "/resources/breathing-exercises.pdf",
    description: "Ejercicios de respiración para mejorar la función pulmonar."
  },
  {
    id: 4,
    name: "Alimentación Saludable",
    icon: "utensils",
    category: "nutrition",
    color: "#A855F7",
    url: "/resources/healthy-eating.pdf",
    description: "Guía de alimentación para personas con condiciones crónicas."
  },
  {
    id: 5,
    name: "Técnicas de Relajación",
    icon: "smile",
    category: "mental-health",
    color: "#EC4899",
    url: "/resources/relaxation-techniques.pdf",
    description: "Técnicas para reducir el estrés y mejorar la salud mental."
  },
  {
    id: 6,
    name: "Adherencia a Medicamentos",
    icon: "pill",
    category: "medication",
    color: "#F59E0B",
    url: "/resources/medication-adherence.pdf",
    description: "Importancia de seguir correctamente los tratamientos prescritos."
  }
];

// Datos de ejemplo para pacientes
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    fullName: "María García Rodríguez",
    age: 56,
    gender: "Femenino",
    status: "Activo",
    fecha_nacimiento: "1969-05-10",
    conditions: [
      {
        id: 1,
        name: "Hipertensión",
        icon: "heart-pulse",
        lastUpdated: "2023-11-01T10:30:00Z"
      },
      {
        id: 2,
        name: "Diabetes Tipo 2",
        icon: "droplet",
        lastUpdated: "2023-11-02T14:45:00Z"
      }
    ]
  },
  {
    id: 2,
    fullName: "Carlos Martínez López",
    age: 68,
    gender: "Masculino",
    status: "Activo",
    fecha_nacimiento: "1957-11-22",
    conditions: [
      {
        id: 1,
        name: "Hipertensión",
        icon: "heart-pulse",
        lastUpdated: "2023-10-28T08:15:00Z"
      },
      {
        id: 3,
        name: "Asma",
        icon: "lungs",
        lastUpdated: "2023-10-31T08:15:00Z"
      }
    ]
  },
  {
    id: 3,
    fullName: "Ana Jiménez Ortiz",
    age: 42,
    gender: "Femenino",
    status: "Inactivo",
    fecha_nacimiento: "1983-03-15",
    conditions: [
      {
        id: 3,
        name: "Asma",
        icon: "lungs",
        lastUpdated: "2023-10-25T15:45:00Z"
      }
    ]
  }
];