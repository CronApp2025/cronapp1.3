import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Definimos las etapas del formulario
enum FormStage {
  PlanAlimenticio = 0,
  ActividadFisica = 1,
  CuidadoSalud = 2,
  DatosPersonales = 3,
  Completado = 4,
}

export function OnboardingForm() {
  const [stage, setStage] = useState<FormStage>(FormStage.PlanAlimenticio);
  const [progress, setProgress] = useState<number>(0);
  const { user, updateUserInfo } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Estado para el formulario completo
  const [formData, setFormData] = useState({
    // Plan Alimenticio
    diasFrutasSemana: 3,
    diasVerdurasEmana: 3,
    diasComidaRapidaSemana: 2,
    
    // Actividad Física
    diasEjercicioSemana: 2,
    minutosEjercicioDia: 30,
    tipoEjercicio: "moderado",
    
    // Cuidado de Salud
    diasControlGlucosaSemana: 0,
    diasRevisionPiesSemana: 0,
    tomasMedicamentos: "siempre",
    visitaMedicoRegular: true,
    controlEnfermedades: true,
    
    // Datos Personales
    peso: 70,
    altura: 170,
    imc: 24.2,
    fechaNacimiento: user?.fecha_nacimiento ? new Date(user.fecha_nacimiento) : new Date(),
    sexo: "masculino",
    actividadLaboral: "sedentario",
    historialFamiliar: false,
  });

  // Calcular progreso en base a la etapa actual
  const updateProgress = (currentStage: FormStage) => {
    const totalStages = 4; // Excluimos la etapa "Completado"
    const progressPercent = (currentStage / totalStages) * 100;
    setProgress(progressPercent);
  };

  // Actualizar estado del formulario
  const updateForm = (name: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Si actualizamos peso o altura, recalcular IMC
      if (name === 'peso' || name === 'altura') {
        const peso = name === 'peso' ? value : prev.peso;
        const altura = name === 'altura' ? value : prev.altura;
        const alturaMetros = altura / 100;
        const imc = Math.round((peso / (alturaMetros * alturaMetros)) * 10) / 10;
        newData.imc = imc;
      }
      
      return newData;
    });
  };

  // Manejar el cambio de etapa
  const handleNextStage = () => {
    const nextStage = stage + 1;
    setStage(nextStage as FormStage);
    updateProgress(nextStage as FormStage);
    
    // Mostrar mensaje positivo
    const messages = [
      "¡Muy bien! Sigamos avanzando.",
      "¡Excelente progreso! Continuemos.",
      "¡Vas muy bien! Casi terminamos.",
      "¡Último paso! Gracias por tu paciencia.",
    ];
    
    if (nextStage < FormStage.Completado) {
      toast({
        title: "Progreso guardado",
        description: messages[stage],
      });
    }
  };

  // Manejar el envío final del formulario
  const handleSubmit = async () => {
    try {
      // Enviar datos al backend
      const response = await apiRequest("POST", "/api/settings/onboarding", formData, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "¡Perfil completado!",
          description: "Gracias por completar tu perfil de salud. Esto nos ayudará a personalizar tu experiencia.",
        });
        
        // Actualizar datos del usuario si es necesario
        if (data.data?.user) {
          updateUserInfo(data.data.user);
        }
        
        // Navegar al dashboard
        navigate("/dashboard");
      } else {
        throw new Error(data.message || "Error al guardar el perfil");
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      toast({
        title: "Error",
        description: "No pudimos guardar tu información. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Renderiza la etapa actual del formulario
  const renderStage = () => {
    switch (stage) {
      case FormStage.PlanAlimenticio:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <h2 className="text-2xl font-medium text-blue-600">Plan Alimenticio</h2>
              <p className="text-gray-600 pt-2">
                Cuéntanos sobre tus hábitos alimenticios para personalizar tu plan
              </p>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has consumido al menos 2 porciones de frutas?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasFrutasSemana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasFrutasSemana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasFrutasSemana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasFrutasSemana} días
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has consumido al menos 2 porciones de verduras?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasVerdurasEmana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasVerdurasEmana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasVerdurasEmana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasVerdurasEmana} días
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has consumido comida rápida o procesada?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasComidaRapidaSemana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasComidaRapidaSemana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasComidaRapidaSemana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasComidaRapidaSemana} días
                </p>
              </div>

              <Button onClick={handleNextStage} className="w-full">Continuar</Button>
            </div>
          </div>
        );

      case FormStage.ActividadFisica:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Actividad Física</CardTitle>
              <CardDescription className="text-center pt-2">
                Hablemos sobre tu rutina de ejercicios y movimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has realizado al menos 30 minutos de ejercicio?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasEjercicioSemana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasEjercicioSemana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasEjercicioSemana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasEjercicioSemana} días
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  En promedio, ¿cuántos minutos dedicas a ejercitarte en esos días?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.minutosEjercicioDia]} 
                    min={0} 
                    max={120} 
                    step={10}
                    onValueChange={(value) => updateForm('minutosEjercicioDia', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    <span className={formData.minutosEjercicioDia === 0 ? "text-primary font-medium" : ""}>0</span>
                    <span className={formData.minutosEjercicioDia === 30 ? "text-primary font-medium" : ""}>30</span>
                    <span className={formData.minutosEjercicioDia === 60 ? "text-primary font-medium" : ""}>60</span>
                    <span className={formData.minutosEjercicioDia === 90 ? "text-primary font-medium" : ""}>90</span>
                    <span className={formData.minutosEjercicioDia === 120 ? "text-primary font-medium" : ""}>120</span>
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.minutosEjercicioDia} minutos
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  ¿Qué tipo de ejercicio realizas con mayor frecuencia?
                </Label>
                <RadioGroup 
                  value={formData.tipoEjercicio}
                  onValueChange={(value) => updateForm('tipoEjercicio', value)}
                  className="flex flex-col space-y-2 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leve" id="leve" />
                    <Label htmlFor="leve" className="cursor-pointer">Leve (caminar, estiramientos)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderado" id="moderado" />
                    <Label htmlFor="moderado" className="cursor-pointer">Moderado (ciclismo, natación)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intenso" id="intenso" />
                    <Label htmlFor="intenso" className="cursor-pointer">Intenso (correr, entrenamiento de fuerza)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStage(FormStage.PlanAlimenticio);
                    updateProgress(FormStage.PlanAlimenticio);
                  }}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button onClick={handleNextStage} className="flex-1">Continuar</Button>
              </div>
            </CardContent>
          </div>
        );

      case FormStage.CuidadoSalud:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Cuidado de Salud</CardTitle>
              <CardDescription className="text-center pt-2">
                Información sobre tus hábitos de cuidado personal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has revisado tu nivel de glucosa?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasControlGlucosaSemana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasControlGlucosaSemana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasControlGlucosaSemana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasControlGlucosaSemana} días
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  ¿Cuántos días de los últimos 7 has revisado tus pies (para pacientes diabéticos)?
                </Label>
                <div className="pt-2 pb-6">
                  <Slider 
                    value={[formData.diasRevisionPiesSemana]} 
                    min={0} 
                    max={7} 
                    step={1}
                    onValueChange={(value) => updateForm('diasRevisionPiesSemana', value[0])}
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={cn(
                        formData.diasRevisionPiesSemana === i ? "text-primary font-medium" : ""
                      )}>{i}</span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-primary font-medium">
                  {formData.diasRevisionPiesSemana} días
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  ¿Tomas tus medicamentos según lo prescrito?
                </Label>
                <RadioGroup 
                  value={formData.tomasMedicamentos}
                  onValueChange={(value) => updateForm('tomasMedicamentos', value)}
                  className="flex flex-col space-y-2 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="siempre" id="siempre" />
                    <Label htmlFor="siempre" className="cursor-pointer">Siempre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casi-siempre" id="casi-siempre" />
                    <Label htmlFor="casi-siempre" className="cursor-pointer">Casi siempre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ocasionalmente" id="ocasionalmente" />
                    <Label htmlFor="ocasionalmente" className="cursor-pointer">Ocasionalmente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nunca" id="nunca" />
                    <Label htmlFor="nunca" className="cursor-pointer">Nunca</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    ¿Visitas regularmente a tu médico?
                  </Label>
                  <Switch 
                    checked={formData.visitaMedicoRegular}
                    onCheckedChange={(checked) => updateForm('visitaMedicoRegular', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    ¿Tienes alguna enfermedad crónica bajo control?
                  </Label>
                  <Switch 
                    checked={formData.controlEnfermedades}
                    onCheckedChange={(checked) => updateForm('controlEnfermedades', checked)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStage(FormStage.ActividadFisica);
                    updateProgress(FormStage.ActividadFisica);
                  }}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button onClick={handleNextStage} className="flex-1">Continuar</Button>
              </div>
            </CardContent>
          </div>
        );

      case FormStage.DatosPersonales:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Datos Personales</CardTitle>
              <CardDescription className="text-center pt-2">
                Información básica para personalizar tu perfil de salud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input 
                    id="peso"
                    type="number" 
                    min={30}
                    max={200}
                    value={formData.peso}
                    onChange={(e) => updateForm('peso', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input 
                    id="altura"
                    type="number" 
                    min={100}
                    max={220}
                    value={formData.altura}
                    onChange={(e) => updateForm('altura', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Índice de Masa Corporal (IMC)</Label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span>{formData.imc}</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    formData.imc < 18.5 ? "bg-blue-100 text-blue-800" : 
                    formData.imc < 25 ? "bg-green-100 text-green-800" :
                    formData.imc < 30 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {formData.imc < 18.5 ? "Bajo peso" : 
                     formData.imc < 25 ? "Normal" :
                     formData.imc < 30 ? "Sobrepeso" :
                     "Obesidad"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fechaNacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fechaNacimiento ? (
                        format(formData.fechaNacimiento, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.fechaNacimiento}
                      onSelect={(date) => date && updateForm('fechaNacimiento', date)}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={2023}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-base">
                  Sexo
                </Label>
                <RadioGroup 
                  value={formData.sexo}
                  onValueChange={(value) => updateForm('sexo', value)}
                  className="flex justify-center gap-8 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="femenino" />
                    <Label htmlFor="femenino" className="cursor-pointer">Femenino</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    ¿Tienes historial familiar de enfermedades crónicas?
                  </Label>
                  <Switch 
                    checked={formData.historialFamiliar}
                    onCheckedChange={(checked) => updateForm('historialFamiliar', checked)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStage(FormStage.CuidadoSalud);
                    updateProgress(FormStage.CuidadoSalud);
                  }}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button onClick={handleSubmit} className="flex-1">Finalizar</Button>
              </div>
            </CardContent>
          </div>
        );

      case FormStage.Completado:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">¡Perfil Completo!</CardTitle>
              <CardDescription className="text-center pt-4">
                Gracias por completar tu perfil de salud. Con esta información podremos ayudarte mejor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-center">
              <div className="h-32 flex items-center justify-center">
                <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg">
                Tu dashboard personalizado está listo para usarse.
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Ir al Dashboard
              </Button>
            </CardContent>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border rounded-lg shadow-lg overflow-hidden bg-white">
        <div className="p-4">
          <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="relative overflow-hidden">
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mt-12 -mr-12 z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-50 rounded-full -mb-8 -ml-8 z-0"></div>
          
          {/* Contenido del formulario */}
          <div className="relative z-10 p-6">
            {renderStage()}
          </div>
        </div>
      </div>
    </div>
  );
}