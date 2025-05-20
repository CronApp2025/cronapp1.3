import React, { useState } from 'react';
import { useLocation } from 'wouter';

// Etapas del formulario
enum FormStage {
  PlanAlimenticio = 0,
  ActividadFisica = 1,
  CuidadoSalud = 2,
  DatosPersonales = 3,
  Completado = 4,
}

export function OnboardingFormSimple() {
  const [stage, setStage] = useState<FormStage>(FormStage.PlanAlimenticio);
  const [, navigate] = useLocation();
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
    fechaNacimiento: new Date(1990, 0, 1),
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
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Error al guardar datos de onboarding');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };
  
  // Renderizado condicional según la etapa actual
  const renderStage = () => {
    switch (stage) {
      case FormStage.PlanAlimenticio:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-medium text-blue-600 text-center mb-2">Plan Alimenticio</h2>
            <p className="text-gray-600 text-center mb-8">
              Cuéntanos sobre tus hábitos alimenticios para personalizar tu plan
            </p>
            
            <div className="mb-6">
              <label className="block mb-2 text-gray-700">
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
            
            <div className="mb-6">
              <label className="block mb-2 text-gray-700">
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
            
            <div className="mb-8">
              <label className="block mb-2 text-gray-700">
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
            
            <button 
              onClick={handleNextStage} 
              className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Continuar
            </button>
          </div>
        );
        
      case FormStage.ActividadFisica:
        return (
          <div className="stage-container">
            <h2 className="stage-title">Actividad Física</h2>
            <p className="stage-description">
              Cuéntanos sobre tu nivel de actividad física actual
            </p>
            
            <div className="form-group">
              <label>
                ¿Cuántos días de los últimos 7 has realizado al menos 30 minutos de ejercicio?
              </label>
              <input 
                type="range" 
                min="0" 
                max="7" 
                value={formData.diasEjercicioSemana}
                onChange={(e) => updateForm('diasEjercicioSemana', parseInt(e.target.value))}
              />
              <span>{formData.diasEjercicioSemana} días</span>
            </div>
            
            <div className="form-group">
              <label>
                En promedio, ¿cuántos minutos de ejercicio realizas en esos días?
              </label>
              <input 
                type="range" 
                min="0" 
                max="120" 
                step="5"
                value={formData.minutosEjercicioDia}
                onChange={(e) => updateForm('minutosEjercicioDia', parseInt(e.target.value))}
              />
              <span>{formData.minutosEjercicioDia} minutos</span>
            </div>
            
            <div className="form-group">
              <label>¿Cómo describirías tu nivel de actividad diaria?</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="nivelActividad" 
                    value="sedentario" 
                    checked={formData.nivelActividad === 'sedentario'}
                    onChange={() => updateForm('nivelActividad', 'sedentario')}
                  />
                  Sedentario (poco o ningún ejercicio)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="nivelActividad" 
                    value="moderado" 
                    checked={formData.nivelActividad === 'moderado'}
                    onChange={() => updateForm('nivelActividad', 'moderado')}
                  />
                  Moderado (ejercicio 1-3 veces/semana)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="nivelActividad" 
                    value="activo" 
                    checked={formData.nivelActividad === 'activo'}
                    onChange={() => updateForm('nivelActividad', 'activo')}
                  />
                  Activo (ejercicio 3-5 veces/semana)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="nivelActividad" 
                    value="muy_activo" 
                    checked={formData.nivelActividad === 'muy_activo'}
                    onChange={() => updateForm('nivelActividad', 'muy_activo')}
                  />
                  Muy activo (ejercicio 6-7 veces/semana)
                </label>
              </div>
            </div>
            
            <div className="button-group">
              <button onClick={handlePrevStage} className="prev-button">Anterior</button>
              <button onClick={handleNextStage} className="next-button">Continuar</button>
            </div>
          </div>
        );
        
      case FormStage.CuidadoSalud:
        return (
          <div className="stage-container">
            <h2 className="stage-title">Cuidado de Salud</h2>
            <p className="stage-description">
              Cuéntanos sobre tus hábitos de cuidado de salud
            </p>
            
            <div className="form-group">
              <label>
                ¿Cuántos días de los últimos 7 has revisado tu nivel de glucosa?
              </label>
              <input 
                type="range" 
                min="0" 
                max="7" 
                value={formData.diasControlGlucosaSemana}
                onChange={(e) => updateForm('diasControlGlucosaSemana', parseInt(e.target.value))}
              />
              <span>{formData.diasControlGlucosaSemana} días</span>
            </div>
            
            <div className="form-group">
              <label>
                ¿Cuántos días de los últimos 7 has tomado toda tu medicación prescrita?
              </label>
              <input 
                type="range" 
                min="0" 
                max="7" 
                value={formData.diasMedicacionCompleta}
                onChange={(e) => updateForm('diasMedicacionCompleta', parseInt(e.target.value))}
              />
              <span>{formData.diasMedicacionCompleta} días</span>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.tieneAlergias}
                  onChange={(e) => updateForm('tieneAlergias', e.target.checked)}
                />
                ¿Tienes alguna alergia a medicamentos o alimentos?
              </label>
            </div>
            
            <div className="button-group">
              <button onClick={handlePrevStage} className="prev-button">Anterior</button>
              <button onClick={handleNextStage} className="next-button">Continuar</button>
            </div>
          </div>
        );
        
      case FormStage.DatosPersonales:
        return (
          <div className="stage-container">
            <h2 className="stage-title">Datos Personales</h2>
            <p className="stage-description">
              Por último, necesitamos algunos datos personales para completar tu perfil
            </p>
            
            <div className="form-group">
              <label>Peso (kg)</label>
              <input 
                type="number" 
                min="20" 
                max="250" 
                value={formData.peso}
                onChange={(e) => updateForm('peso', parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label>Altura (cm)</label>
              <input 
                type="number" 
                min="50" 
                max="250" 
                value={formData.altura}
                onChange={(e) => updateForm('altura', parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input 
                type="date" 
                value={formData.fechaNacimiento.toISOString().split('T')[0]}
                onChange={(e) => updateForm('fechaNacimiento', new Date(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label>Género</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="genero" 
                    value="masculino" 
                    checked={formData.genero === 'masculino'}
                    onChange={() => updateForm('genero', 'masculino')}
                  />
                  Masculino
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="genero" 
                    value="femenino" 
                    checked={formData.genero === 'femenino'}
                    onChange={() => updateForm('genero', 'femenino')}
                  />
                  Femenino
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="genero" 
                    value="no_binario" 
                    checked={formData.genero === 'no_binario'}
                    onChange={() => updateForm('genero', 'no_binario')}
                  />
                  No binario
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="genero" 
                    value="no_especificado" 
                    checked={formData.genero === 'no_especificado'}
                    onChange={() => updateForm('genero', 'no_especificado')}
                  />
                  Prefiero no especificar
                </label>
              </div>
            </div>
            
            <div className="button-group">
              <button onClick={handlePrevStage} className="prev-button">Anterior</button>
              <button onClick={handleNextStage} className="next-button">Finalizar</button>
            </div>
          </div>
        );
        
      case FormStage.Completado:
        return (
          <div className="stage-container completion">
            <h2 className="stage-title">¡Proceso Completado!</h2>
            <p className="stage-description">
              Gracias por completar tu perfil. Estamos personalizando tu experiencia.
            </p>
            <div className="completion-animation">
              <div className="checkmark"></div>
            </div>
            <p>Serás redirigido automáticamente en unos segundos...</p>
          </div>
        );
    }
  };
  
  return (
    <div className="w-full max-w-600px mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden m-3">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="p-6 relative">
        {renderStage()}
      </div>
    </div>
  );
}