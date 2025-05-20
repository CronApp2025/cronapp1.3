import React, { useState } from 'react';
import { useNavigate } from 'wouter/use-location';

// Definimos las etapas del formulario
enum FormStage {
  PlanAlimenticio = 0,
  ActividadFisica = 1,
  CuidadoSalud = 2,
  DatosPersonales = 3,
  Completado = 4,
}

export function OnboardingFormPage() {
  const [stage, setStage] = useState<FormStage>(FormStage.PlanAlimenticio);
  const [, navigate] = useNavigate();
  const [progress, setProgress] = useState(20);
  
  // Formulario con valores iniciales
  const [formData, setFormData] = useState({
    // Plan Alimenticio
    diasFrutasSemana: 3,
    diasVerdurasSemana: 3,
    diasComidaRapidaSemana: 2,
    
    // Actividad Física
    diasEjercicioSemana: 2,
    minutosEjercicioDia: 30,
    nivelActividad: 'moderado',
    
    // Cuidado de Salud
    diasControlGlucosaSemana: 3,
    diasMedicacionCompleta: 5,
    tieneAlergias: false,
    
    // Datos Personales
    peso: 70,
    altura: 170,
    fechaNacimiento: '1990-01-01',
    genero: 'no_especificado',
  });
  
  // Actualiza el progreso basado en la etapa actual
  const updateProgress = (currentStage: FormStage) => {
    const progressMap = {
      [FormStage.PlanAlimenticio]: 20,
      [FormStage.ActividadFisica]: 40,
      [FormStage.CuidadoSalud]: 60,
      [FormStage.DatosPersonales]: 80,
      [FormStage.Completado]: 100,
    };
    
    setProgress(progressMap[currentStage]);
  };
  
  // Actualiza valores del formulario
  const updateForm = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  // Avanza a la siguiente etapa
  const handleNextStage = () => {
    const nextStage = stage + 1;
    if (nextStage <= FormStage.Completado) {
      setStage(nextStage);
      updateProgress(nextStage);
      
      if (nextStage === FormStage.Completado) {
        // Enviar datos al backend cuando se completa
        saveOnboardingData();
      }
    }
  };
  
  // Vuelve a la etapa anterior
  const handlePrevStage = () => {
    const prevStage = stage - 1;
    if (prevStage >= FormStage.PlanAlimenticio) {
      setStage(prevStage);
      updateProgress(prevStage);
    }
  };
  
  // Envía los datos al servidor
  const saveOnboardingData = async () => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        console.error('Error al guardar datos de onboarding');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };
  
  // Renderizado según la etapa actual
  const renderStage = () => {
    switch (stage) {
      case FormStage.PlanAlimenticio:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-blue-600">Plan Alimenticio</h2>
              <p className="text-gray-600 mt-2">
                Cuéntanos sobre tus hábitos alimenticios para personalizar tu plan
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has consumido al menos 2 porciones de frutas?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasFrutasSemana}
                  onChange={(e) => updateForm('diasFrutasSemana', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasFrutasSemana} días</p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has consumido al menos 2 porciones de verduras?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasVerdurasSemana}
                  onChange={(e) => updateForm('diasVerdurasSemana', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasVerdurasSemana} días</p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has consumido comida rápida?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasComidaRapidaSemana}
                  onChange={(e) => updateForm('diasComidaRapidaSemana', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasComidaRapidaSemana} días</p>
              </div>
            </div>
            
            <button 
              onClick={handleNextStage} 
              className="w-full py-2 px-4 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
            >
              Continuar
            </button>
          </div>
        );
        
      case FormStage.ActividadFisica:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-blue-600">Actividad Física</h2>
              <p className="text-gray-600 mt-2">
                Cuéntanos sobre tu nivel de actividad física
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has realizado al menos 30 minutos de ejercicio?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasEjercicioSemana}
                  onChange={(e) => updateForm('diasEjercicioSemana', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasEjercicioSemana} días</p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  En promedio, ¿cuántos minutos de ejercicio realizas en esos días?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  step="5"
                  value={formData.minutosEjercicioDia}
                  onChange={(e) => updateForm('minutosEjercicioDia', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.minutosEjercicioDia} minutos</p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cómo describirías tu nivel de actividad diaria?
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="sedentario" 
                      name="nivelActividad" 
                      value="sedentario" 
                      checked={formData.nivelActividad === 'sedentario'}
                      onChange={() => updateForm('nivelActividad', 'sedentario')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sedentario" className="ml-2 text-sm text-gray-700">
                      Sedentario (poco o ningún ejercicio)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="moderado" 
                      name="nivelActividad" 
                      value="moderado" 
                      checked={formData.nivelActividad === 'moderado'}
                      onChange={() => updateForm('nivelActividad', 'moderado')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="moderado" className="ml-2 text-sm text-gray-700">
                      Moderado (ejercicio 1-3 veces/semana)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="activo" 
                      name="nivelActividad" 
                      value="activo" 
                      checked={formData.nivelActividad === 'activo'}
                      onChange={() => updateForm('nivelActividad', 'activo')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                      Activo (ejercicio 3-5 veces/semana)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="muy_activo" 
                      name="nivelActividad" 
                      value="muy_activo" 
                      checked={formData.nivelActividad === 'muy_activo'}
                      onChange={() => updateForm('nivelActividad', 'muy_activo')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="muy_activo" className="ml-2 text-sm text-gray-700">
                      Muy activo (ejercicio 6-7 veces/semana)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={handlePrevStage} 
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextStage} 
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        );
        
      case FormStage.CuidadoSalud:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-blue-600">Cuidado de Salud</h2>
              <p className="text-gray-600 mt-2">
                Cuéntanos sobre tus hábitos de cuidado de salud
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has revisado tu nivel de glucosa?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasControlGlucosaSemana}
                  onChange={(e) => updateForm('diasControlGlucosaSemana', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasControlGlucosaSemana} días</p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ¿Cuántos días de los últimos 7 has tomado toda tu medicación prescrita?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={formData.diasMedicacionCompleta}
                  onChange={(e) => updateForm('diasMedicacionCompleta', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 text-blue-600 font-medium">{formData.diasMedicacionCompleta} días</p>
              </div>
              
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="tieneAlergias"
                    type="checkbox"
                    checked={formData.tieneAlergias}
                    onChange={(e) => updateForm('tieneAlergias', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="tieneAlergias" className="ml-2 text-sm text-gray-700">
                  ¿Tienes alguna alergia a medicamentos o alimentos?
                </label>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={handlePrevStage} 
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextStage} 
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        );
        
      case FormStage.DatosPersonales:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-blue-600">Datos Personales</h2>
              <p className="text-gray-600 mt-2">
                Por último, necesitamos algunos datos personales para completar tu perfil
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="peso" className="block mb-2 text-sm font-medium text-gray-700">
                  Peso (kg)
                </label>
                <input 
                  type="number" 
                  id="peso"
                  min="20" 
                  max="250" 
                  value={formData.peso}
                  onChange={(e) => updateForm('peso', parseInt(e.target.value))}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="altura" className="block mb-2 text-sm font-medium text-gray-700">
                  Altura (cm)
                </label>
                <input 
                  type="number" 
                  id="altura"
                  min="50" 
                  max="250" 
                  value={formData.altura}
                  onChange={(e) => updateForm('altura', parseInt(e.target.value))}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="fechaNacimiento" className="block mb-2 text-sm font-medium text-gray-700">
                  Fecha de nacimiento
                </label>
                <input 
                  type="date" 
                  id="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={(e) => updateForm('fechaNacimiento', e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Género
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="masculino" 
                      name="genero" 
                      value="masculino" 
                      checked={formData.genero === 'masculino'}
                      onChange={() => updateForm('genero', 'masculino')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="masculino" className="ml-2 text-sm text-gray-700">
                      Masculino
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="femenino" 
                      name="genero" 
                      value="femenino" 
                      checked={formData.genero === 'femenino'}
                      onChange={() => updateForm('genero', 'femenino')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="femenino" className="ml-2 text-sm text-gray-700">
                      Femenino
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="no_binario" 
                      name="genero" 
                      value="no_binario" 
                      checked={formData.genero === 'no_binario'}
                      onChange={() => updateForm('genero', 'no_binario')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="no_binario" className="ml-2 text-sm text-gray-700">
                      No binario
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="no_especificado" 
                      name="genero" 
                      value="no_especificado" 
                      checked={formData.genero === 'no_especificado'}
                      onChange={() => updateForm('genero', 'no_especificado')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="no_especificado" className="ml-2 text-sm text-gray-700">
                      Prefiero no especificar
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={handlePrevStage} 
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextStage} 
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        );
        
      case FormStage.Completado:
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-blue-600">¡Proceso Completado!</h2>
            <p className="text-gray-600 mt-2 mb-6">
              Gracias por completar tu perfil. Estamos personalizando tu experiencia.
            </p>
            <p className="text-sm text-gray-500">Serás redirigido automáticamente en unos segundos...</p>
          </div>
        );
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-2 bg-gray-200">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="p-6">
          {renderStage()}
        </div>
      </div>
    </div>
  );
}