import React, { useState } from "react";
import { usePatients } from "@/hooks/use-patient";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, 
  ChevronRight, 
  CircleUser, 
  Plus, 
  Search, 
  UserPlus,
  Activity,
  CalendarDays,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateString } from "@/lib/utils";
import { Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

// Componente para mostrar estado del paciente con un color correspondiente
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
        return { label: 'Activo', color: 'bg-green-100 text-green-800' };
      case 'inactive':
      case 'inactivo':
        return { label: 'Inactivo', color: 'bg-neutral-100 text-neutral-800' };
      case 'pending':
      case 'pendiente':
        return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
      case 'critical':
      case 'crítico':
        return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-blue-100 text-blue-800' };
    }
  };

  const { label, color } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Formulario para agregar nuevo paciente
const AddPatientForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    género: 'Masculino',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos a la API
    console.log('Datos del formulario:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="nombre" className="text-sm font-medium text-neutral-700">
            Nombre
          </label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Juan"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="apellido" className="text-sm font-medium text-neutral-700">
            Apellido
          </label>
          <Input
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej. Pérez"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fecha_nacimiento" className="text-sm font-medium text-neutral-700">
            Fecha de Nacimiento
          </label>
          <Input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="género" className="text-sm font-medium text-neutral-700">
            Género
          </label>
          <Select
            value={formData.género}
            onValueChange={(value) => handleSelectChange('género', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
              <SelectItem value="Prefiero no decirlo">Prefiero no decirlo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Paciente</Button>
      </DialogFooter>
    </form>
  );
};

// Componente principal de la lista de pacientes
export function PatientsList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const itemsPerPage = 5;

  // Hook para obtener todos los pacientes
  const { 
    data: patients,
    isLoading: loadingPatients,
    error: patientsError 
  } = usePatients();

  // Función para filtrar pacientes según búsqueda y estado
  const filteredPatients = patients?.filter((patient: Patient) => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || patient.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) || [];

  // Paginación
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Gestionar página siguiente y anterior
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Función para calcular la edad basada en la fecha de nacimiento
  const calculateAge = (birthDateStr: string): number => {
    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // Ajustar si aún no ha pasado el cumpleaños este año
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      console.error("Error calculando edad:", e);
      return 0;
    }
  };

  // En caso de error en la carga de pacientes
  if (patientsError) {
    return (
      <div className="rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-800">Error al cargar pacientes</h3>
            <p className="text-neutral-500 mt-1">
              No se pudieron obtener los datos. Por favor, inténtelo de nuevo más tarde.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar estado de carga mientras se obtienen los datos
  if (loadingPatients) {
    return (
      <div className="rounded-lg border shadow-sm p-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex space-x-4">
              <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
              <div className="flex-1 py-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-neutral-200">
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 sm:items-center">
          <h2 className="text-xl font-semibold text-neutral-800">Listado de Pacientes</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Paciente</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo paciente en el sistema.
                </DialogDescription>
              </DialogHeader>
              <AddPatientForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Buscar paciente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Condiciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CircleUser className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-neutral-500">No se encontraron pacientes</p>
                    {searchTerm || statusFilter ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("");
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Paciente
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient: Patient) => (
                <TableRow key={patient.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <CircleUser className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{patient.fullName}</div>
                        <div className="text-xs text-neutral-500 flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {formatDateString(patient.fecha_nacimiento)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{calculateAge(patient.fecha_nacimiento)}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>
                    <StatusBadge status={patient.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions && patient.conditions.length > 0 ? (
                        patient.conditions.slice(0, 2).map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs whitespace-nowrap">
                            {condition.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-500">Sin condiciones</span>
                      )}
                      {patient.conditions && patient.conditions.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-neutral-100">
                          +{patient.conditions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setLocation(`/paciente/${patient.id}`)}>
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar información</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Historial médico</DropdownMenuItem>
                        <DropdownMenuItem>Asignar tratamiento</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Eliminar paciente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredPatients.length > 0 && (
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(startIndex + itemsPerPage, filteredPatients.length)} de{" "}
            {filteredPatients.length} pacientes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {currentPage} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}