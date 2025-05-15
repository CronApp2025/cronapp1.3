import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleUser,
  Clock,
  Download,
  Edit2,
  FileText,
  Heart,
  History,
  Pill,
  Plus,
  Printer,
  Stethoscope,
  Trash2,
  User,
  X
} from "lucide-react";
import { usePatientData } from "@/hooks/use-patient";
import { formatDateString } from "@/lib/utils";
import { Patient, Condition, Alert as AlertType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Función para calcular la edad
const calculateAge = (birthDateStr: string): number => {
  try {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Ajustar la edad si no ha cumplido años todavía este año
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (e) {
    console.error("Error calculando edad:", e);
    return 0;
  }
};

// Componente para mostrar detalles del paciente
export function PatientDetail({ id }: { id: string }) {
  const { patient, conditions, alerts, isLoading, isError } = usePatientData(id);
  const [location, setLocation] = useLocation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedCondition, setExpandedCondition] = useState<number | null>(null);

  // Estado para dialogs de funcionalidades
  const [addNoteDialog, setAddNoteDialog] = useState(false);
  const [editPatientDialog, setEditPatientDialog] = useState(false);
  const [addTreatmentDialog, setAddTreatmentDialog] = useState(false);

  // Función para obtener el color de severidad
  const getSeverityColor = (riskLevel: number | null) => {
    if (!riskLevel) return "bg-[#4caf50]";
    if (riskLevel >= 90) return "bg-[#f44336]";
    if (riskLevel >= 70) return "bg-[#ff9800]";
    if (riskLevel >= 50) return "bg-[#ffeb3b]";
    return "bg-[#4caf50]";
  };

  // Obtener condición principal y alerta crítica si existen
  const primaryCondition = conditions?.[0];
  const criticalAlert = alerts?.find((a: AlertType) => (a.riskLevel || 0) > 80);

  // Formulario de datos del paciente
  const [patientForm, setPatientForm] = useState<{
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    gender: string;
  }>({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    gender: 'Masculino'
  });

  // Inicializar formulario cuando se cargan los datos del paciente
  useEffect(() => {
    if (patient) {
      const nameParts = patient.fullName.split(' ');
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';

      setPatientForm({
        nombre,
        apellido,
        fecha_nacimiento: patient.fecha_nacimiento,
        gender: patient.gender
      });
    }
  }, [patient]);

  // Manejo de formulario de edición
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos actualizados:', patientForm);
    setEditPatientDialog(false);
    // Aquí iría la llamada a la API para actualizar el paciente
  };

  // Manejo de formulario de nota
  const [noteForm, setNoteForm] = useState({
    note: '',
    type: 'clinical'
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteForm(prev => ({ ...prev, note: e.target.value }));
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nueva nota:', noteForm);
    setAddNoteDialog(false);
    // Aquí iría la llamada a la API para agregar una nota
  };

  // Manejo de formulario de tratamiento
  const [treatmentForm, setTreatmentForm] = useState({
    name: '',
    description: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: ''
  });

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTreatmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nuevo tratamiento:', treatmentForm);
    setAddTreatmentDialog(false);
    // Aquí iría la llamada a la API para agregar un tratamiento
  };

  // Manejo de eliminación
  const handleDelete = () => {
    console.log('Eliminar paciente:', id);
    setShowDeleteConfirm(false);
    // Aquí iría la llamada a la API para eliminar el paciente
    setLocation('/pacientes');
  };

  // Si está cargando
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-neutral-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay un error
  if (isError || !patient) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-neutral-800">Error al cargar los datos del paciente</h3>
          <p className="text-neutral-500 mt-1 mb-4 max-w-md">
            No se pudo obtener la información del paciente. Por favor, intente de nuevo más tarde.
          </p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setLocation('/pacientes')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera con barra de navegación */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setLocation('/pacientes')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-neutral-800">Detalles del Paciente</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setEditPatientDialog(true)}
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </Button>
          </div>
        </div>

        {/* Información básica del paciente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-100 to-blue-300 flex items-center justify-center mb-3 transition-all hover:shadow-lg">
              <User className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">{patient.fullName}</h2>
              <p className="text-neutral-500 flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1">
                <span className="flex items-center">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span className="text-sm">{calculateAge(patient.fecha_nacimiento)} años</span>
                </span>
                <span className="hidden sm:inline text-neutral-300">•</span>
                <span className="flex items-center">
                  <CircleUser className="h-3 w-3 mr-1" />
                  <span className="text-sm">{patient.gender}</span>
                </span>
              </p>
              <div className="mt-2">
                <Badge 
                  variant="outline" 
                  className={`${
                    patient.status.toLowerCase() === 'activo' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {primaryCondition && (
              <motion.div 
                className="bg-blue-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-2">
                  {primaryCondition.icon === 'heart-pulse' ? 
                    <Heart className="h-4 w-4 text-primary mr-2" /> : 
                    <Activity className="h-4 w-4 text-primary mr-2" />
                  }
                  <h4 className="text-sm font-semibold text-neutral-700">Diagnóstico Principal</h4>
                </div>
                <div className="text-lg font-semibold text-neutral-800 mb-1">{primaryCondition.name}</div>
                <div className="text-xs text-neutral-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Actualizado: {formatDateString(primaryCondition.lastUpdated || '')}
                </div>
              </motion.div>
            )}

            {criticalAlert && (
              <motion.div 
                className="bg-amber-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                  <h4 className="text-sm font-semibold text-neutral-700">Alerta Activa</h4>
                </div>
                <div className="text-md font-medium text-neutral-800 mb-1">
                  {criticalAlert.description}
                </div>
                <Progress 
                  value={criticalAlert.riskLevel || 0} 
                  className="h-2 bg-neutral-200 mt-2" 
                  indicatorColor={getSeverityColor(criticalAlert.riskLevel)}
                />
              </motion.div>
            )}

            <div className="rounded-lg p-4 bg-neutral-50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-500">Fecha Nacimiento:</span>
                  <span className="text-sm font-medium">{formatDateString(patient.fecha_nacimiento)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-500">ID Paciente:</span>
                  <span className="text-sm font-medium">P-{String(patient.id).padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Última Visita:</span>
                  <span className="text-sm font-medium">
                    {formatDateString(new Date().toISOString())}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-auto self-start text-blue-600">
                <FileText className="h-3 w-3 mr-1" />
                <span className="text-xs">Ver historia completa</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Pestañas para diferentes secciones */}
        <Tabs defaultValue="clinical">
          <TabsList className="mb-4">
            <TabsTrigger value="clinical">Historia Clínica</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-neutral-800">Condiciones Médicas</h3>
              <Button variant="ghost" size="sm" className="text-primary-600">
                <Stethoscope className="h-4 w-4 mr-1" />
                <span>Añadir Condición</span>
              </Button>
            </div>
            {conditions && conditions.length > 0 ? (
              <div className="border rounded-lg divide-y">
                {conditions.map((condition: Condition, index: number) => (
                  <div key={condition.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          {condition.icon === 'heart-pulse' ? 
                            <Heart className="h-4 w-4 text-blue-600" /> : 
                            <Activity className="h-4 w-4 text-blue-600" />
                          }
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-800">{condition.name}</h4>
                          <p className="text-xs text-neutral-500">
                            Diagnosticado: {formatDateString(condition.diagnosed_date || '')}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {condition.type === 'chronic' ? 'Crónico' : 'Agudo'}
                            </Badge>
                            {index === 0 && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpandedCondition(expandedCondition === condition.id ? null : condition.id)}
                      >
                        {expandedCondition === condition.id ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                    
                    {expandedCondition === condition.id && condition.metrics && (
                      <div className="mt-4 pl-11">
                        <h5 className="text-sm font-medium text-neutral-700 mb-2">Métricas Recientes</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {condition.metrics.map(metric => (
                            <div 
                              key={metric.id} 
                              className="bg-neutral-50 rounded-md p-2 border border-neutral-100"
                            >
                              <div className="text-sm text-neutral-600 mb-1">{metric.name}</div>
                              <div className="flex items-baseline">
                                <span 
                                  className={`text-lg font-semibold ${metric.valueColor ? `text-[${metric.valueColor}]` : 'text-neutral-800'}`}
                                >
                                  {metric.value}
                                </span>
                                {metric.label && (
                                  <span className="text-xs text-neutral-500 ml-1">{metric.label}</span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {formatDateString(metric.date_recorded)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-neutral-400" />
                </div>
                <h3 className="text-neutral-700 font-medium mb-1">Sin condiciones registradas</h3>
                <p className="text-neutral-500 text-sm max-w-md mx-auto mb-4">
                  Este paciente no tiene ninguna condición médica registrada en el sistema.
                </p>
                <Button variant="outline" size="sm">
                  <Stethoscope className="h-4 w-4 mr-1" />
                  <span>Añadir Condición</span>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="treatments" className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-neutral-800">Tratamientos Actuales</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-600"
                onClick={() => setAddTreatmentDialog(true)}
              >
                <Pill className="h-4 w-4 mr-1" />
                <span>Añadir Tratamiento</span>
              </Button>
            </div>
            
            <div className="border rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <Pill className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-neutral-700 font-medium mb-1">Sin tratamientos activos</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-4">
                El paciente no tiene tratamientos activos registrados en el sistema.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAddTreatmentDialog(true)}
              >
                <Pill className="h-4 w-4 mr-1" />
                <span>Añadir Tratamiento</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-neutral-800">Métricas y Mediciones</h3>
              <Button variant="ghost" size="sm" className="text-primary-600">
                <Plus className="h-4 w-4 mr-1" />
                <span>Añadir Medición</span>
              </Button>
            </div>
            
            <div className="border rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <Activity className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-neutral-700 font-medium mb-1">Sin métricas disponibles</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-4">
                No hay métricas registradas independientemente para este paciente.
              </p>
              <p className="text-neutral-600 text-sm max-w-md mx-auto">
                Las métricas están disponibles dentro de cada condición médica específica.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-neutral-800">Notas Clínicas</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-600"
                onClick={() => setAddNoteDialog(true)}
              >
                <FileText className="h-4 w-4 mr-1" />
                <span>Añadir Nota</span>
              </Button>
            </div>
            
            <div className="border rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <History className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-neutral-700 font-medium mb-1">Sin notas clínicas</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-4">
                No hay notas clínicas registradas para este paciente.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAddNoteDialog(true)}
              >
                <FileText className="h-4 w-4 mr-1" />
                <span>Añadir Nota</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de eliminación */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar al paciente <strong>{patient.fullName}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Eliminar Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={editPatientDialog} onOpenChange={setEditPatientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Modifique los datos personales del paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={patientForm.nombre}
                  onChange={handleEditFormChange}
                  placeholder="Ej. Juan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={patientForm.apellido}
                  onChange={handleEditFormChange}
                  placeholder="Ej. Pérez"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={patientForm.fecha_nacimiento}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={patientForm.gender}
                  onChange={handleEditFormChange}
                  placeholder="Ej. Masculino"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPatientDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para añadir nota */}
      <Dialog open={addNoteDialog} onOpenChange={setAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nota Clínica</DialogTitle>
            <DialogDescription>
              Registre una nueva nota para el historial del paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota Clínica</Label>
              <Textarea
                id="note"
                name="note"
                value={noteForm.note}
                onChange={handleNoteChange}
                placeholder="Escriba la nota clínica aquí..."
                className="min-h-[150px]"
                required
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddNoteDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Nota</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para añadir tratamiento */}
      <Dialog open={addTreatmentDialog} onOpenChange={setAddTreatmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Tratamiento</DialogTitle>
            <DialogDescription>
              Registre un nuevo tratamiento para el paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTreatmentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Tratamiento</Label>
              <Input
                id="name"
                name="name"
                value={treatmentForm.name}
                onChange={handleTreatmentChange}
                placeholder="Ej. Amoxicilina"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={treatmentForm.description}
                onChange={handleTreatmentChange}
                placeholder="Describa el tratamiento..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosis</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={treatmentForm.dosage}
                  onChange={handleTreatmentChange}
                  placeholder="Ej. 500mg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Input
                  id="frequency"
                  name="frequency"
                  value={treatmentForm.frequency}
                  onChange={handleTreatmentChange}
                  placeholder="Ej. Cada 8 horas"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={treatmentForm.start_date}
                  onChange={handleTreatmentChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Finalización</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={treatmentForm.end_date}
                  onChange={handleTreatmentChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTreatmentDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Tratamiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}