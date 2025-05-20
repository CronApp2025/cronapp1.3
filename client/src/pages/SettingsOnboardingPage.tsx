import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Estilos y componentes
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

// Componente para editar datos de onboarding
export default function SettingsOnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado para los datos del formulario
  const [onboardingData, setOnboardingData] = useState({
    plan_alimenticio: {
      dias_frutas_semana: 3,
      dias_verduras_semana: 3,
      dias_comida_rapida_semana: 2
    },
    actividad_fisica: {
      dias_ejercicio_semana: 2,
      minutos_ejercicio_dia: 30,
      nivel_actividad: 'moderado'
    },
    cuidado_salud: {
      dias_control_glucosa_semana: 3,
      dias_medicacion_completa: 5,
      tiene_alergias: false
    },
    datos_personales: {
      peso: 70,
      altura: 170,
      fecha_nacimiento: '1990-01-01',
      genero: 'no_especificado'
    },
    has_completed_onboarding: false
  });
  
  // Cargar datos de onboarding
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    if (!isLoading && isAuthenticated) {
      fetchOnboardingData();
    }
  }, [isLoading, isAuthenticated, setLocation]);
  
  // Función para obtener datos de onboarding
  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.has_completed_onboarding) {
          setOnboardingData(data.data.onboarding_data);
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: 'No se pudieron cargar los datos de onboarding' 
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión al cargar los datos' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para guardar cambios
  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // Preparar los datos para enviar
      const dataToSend = {
        diasFrutasSemana: onboardingData.plan_alimenticio.dias_frutas_semana,
        diasVerdurasSemana: onboardingData.plan_alimenticio.dias_verduras_semana,
        diasComidaRapidaSemana: onboardingData.plan_alimenticio.dias_comida_rapida_semana,
        
        diasEjercicioSemana: onboardingData.actividad_fisica.dias_ejercicio_semana,
        minutosEjercicioDia: onboardingData.actividad_fisica.minutos_ejercicio_dia,
        nivelActividad: onboardingData.actividad_fisica.nivel_actividad,
        
        diasControlGlucosaSemana: onboardingData.cuidado_salud.dias_control_glucosa_semana,
        diasMedicacionCompleta: onboardingData.cuidado_salud.dias_medicacion_completa,
        tieneAlergias: onboardingData.cuidado_salud.tiene_alergias,
        
        peso: onboardingData.datos_personales.peso,
        altura: onboardingData.datos_personales.altura,
        fechaNacimiento: onboardingData.datos_personales.fecha_nacimiento,
        genero: onboardingData.datos_personales.genero
      };
      
      // Usar la ruta específica para actualizar desde configuración
      const response = await fetch('/api/settings/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include'
      });
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Información guardada correctamente' 
        });
        // Recargar datos después de guardar
        await fetchOnboardingData();
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Error al guardar cambios' 
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión al guardar los datos' 
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handlers para actualizar campos
  const updatePlanAlimenticio = (field: string, value: any) => {
    setOnboardingData({
      ...onboardingData,
      plan_alimenticio: {
        ...onboardingData.plan_alimenticio,
        [field]: value
      }
    });
  };
  
  const updateActividadFisica = (field: string, value: any) => {
    setOnboardingData({
      ...onboardingData,
      actividad_fisica: {
        ...onboardingData.actividad_fisica,
        [field]: value
      }
    });
  };
  
  const updateCuidadoSalud = (field: string, value: any) => {
    setOnboardingData({
      ...onboardingData,
      cuidado_salud: {
        ...onboardingData.cuidado_salud,
        [field]: value
      }
    });
  };
  
  const updateDatosPersonales = (field: string, value: any) => {
    setOnboardingData({
      ...onboardingData,
      datos_personales: {
        ...onboardingData.datos_personales,
        [field]: value
      }
    });
  };
  
  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajustes de Información de Salud</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <Section title="Plan Alimenticio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días con consumo de frutas a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.plan_alimenticio.dias_frutas_semana}
              onChange={(e) => updatePlanAlimenticio('dias_frutas_semana', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.plan_alimenticio.dias_frutas_semana} días
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días con consumo de verduras a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.plan_alimenticio.dias_verduras_semana}
              onChange={(e) => updatePlanAlimenticio('dias_verduras_semana', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.plan_alimenticio.dias_verduras_semana} días
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días con consumo de comida rápida a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.plan_alimenticio.dias_comida_rapida_semana}
              onChange={(e) => updatePlanAlimenticio('dias_comida_rapida_semana', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.plan_alimenticio.dias_comida_rapida_semana} días
            </p>
          </div>
        </div>
      </Section>
      
      <Section title="Actividad Física">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de ejercicio a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.actividad_fisica.dias_ejercicio_semana}
              onChange={(e) => updateActividadFisica('dias_ejercicio_semana', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.actividad_fisica.dias_ejercicio_semana} días
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutos de ejercicio por día
            </label>
            <input 
              type="range" 
              min="0" 
              max="120" 
              step="5"
              value={onboardingData.actividad_fisica.minutos_ejercicio_dia}
              onChange={(e) => updateActividadFisica('minutos_ejercicio_dia', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.actividad_fisica.minutos_ejercicio_dia} minutos
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de actividad
            </label>
            <select
              value={onboardingData.actividad_fisica.nivel_actividad}
              onChange={(e) => updateActividadFisica('nivel_actividad', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="sedentario">Sedentario (poco o ningún ejercicio)</option>
              <option value="moderado">Moderado (ejercicio 1-3 veces/semana)</option>
              <option value="activo">Activo (ejercicio 3-5 veces/semana)</option>
              <option value="muy_activo">Muy activo (ejercicio 6-7 veces/semana)</option>
            </select>
          </div>
        </div>
      </Section>
      
      <Section title="Cuidado de Salud">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de control de glucosa a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.cuidado_salud.dias_control_glucosa_semana}
              onChange={(e) => updateCuidadoSalud('dias_control_glucosa_semana', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.cuidado_salud.dias_control_glucosa_semana} días
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días con medicación completa a la semana
            </label>
            <input 
              type="range" 
              min="0" 
              max="7" 
              value={onboardingData.cuidado_salud.dias_medicacion_completa}
              onChange={(e) => updateCuidadoSalud('dias_medicacion_completa', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center mt-2 text-blue-600 font-medium">
              {onboardingData.cuidado_salud.dias_medicacion_completa} días
            </p>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              id="tiene_alergias"
              type="checkbox"
              checked={onboardingData.cuidado_salud.tiene_alergias}
              onChange={(e) => updateCuidadoSalud('tiene_alergias', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="tiene_alergias" className="ml-2 block text-sm text-gray-700">
              Tiene alergias a medicamentos o alimentos
            </label>
          </div>
        </div>
      </Section>
      
      <Section title="Datos Personales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
              Peso (kg)
            </label>
            <input 
              type="number" 
              id="peso"
              min="20" 
              max="250" 
              value={onboardingData.datos_personales.peso}
              onChange={(e) => updateDatosPersonales('peso', parseInt(e.target.value))}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-2">
              Altura (cm)
            </label>
            <input 
              type="number" 
              id="altura"
              min="50" 
              max="250" 
              value={onboardingData.datos_personales.altura}
              onChange={(e) => updateDatosPersonales('altura', parseInt(e.target.value))}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de nacimiento
            </label>
            <input 
              type="date" 
              id="fecha_nacimiento"
              value={onboardingData.datos_personales.fecha_nacimiento}
              onChange={(e) => updateDatosPersonales('fecha_nacimiento', e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              value={onboardingData.datos_personales.genero}
              onChange={(e) => updateDatosPersonales('genero', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no_binario">No binario</option>
              <option value="no_especificado">Prefiero no especificar</option>
            </select>
          </div>
        </div>
      </Section>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={saveChanges}
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}