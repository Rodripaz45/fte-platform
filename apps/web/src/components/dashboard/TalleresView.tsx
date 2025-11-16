"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Users, MapPin, User } from "lucide-react";
import { talleresApi, type Taller, type CreateTallerDto, type UpdateTallerDto } from "@/lib/api/talleres";
import { trainersApi, type Trainer } from "@/lib/api/trainers";
import { useAuth } from "@/contexts/AuthContext";
import { usePolling } from "@/hooks/usePolling";

interface TalleresViewProps {
  onTallerClick?: (taller: Taller) => void;
}

export default function TalleresView({ onTallerClick }: TalleresViewProps) {
  const { user } = useAuth();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<Taller | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formModalidad, setFormModalidad] = useState<string>('');
  const [formEstado, setFormEstado] = useState<string>('PROGRAMADO');
  const [formTrainerId, setFormTrainerId] = useState<string>('');

  const isAdmin = user?.roles?.some(role => role === 'ADMIN') ?? false;
  const isTrainer = user?.roles?.some(role => role === 'TRAINER') ?? false;
  const canEdit = isAdmin; // Solo ADMIN puede editar talleres

  useEffect(() => {
    loadTalleres();
    if (canEdit) {
      loadTrainers();
    }
  }, [canEdit]);

  // Polling de talleres cada 30 segundos (pausado cuando hay diálogo abierto)
  usePolling(() => {
    loadTalleresSilent();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadTalleres = async () => {
    try {
      setIsLoading(true);
      const data = await talleresApi.getAll();
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar talleres');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTalleresSilent = async () => {
    try {
      const data = await talleresApi.getAll();
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const loadTrainers = async () => {
    try {
      const data = await trainersApi.getAll();
      // Filtrar solo trainers activos
      setTrainers(data.filter(t => t.estado === 'ACTIVO'));
    } catch (err) {
      console.error('Error cargando trainers:', err);
    }
  };

  const handleCreate = () => {
    setEditingTaller(null);
    setFormModalidad('');
    setFormEstado('PROGRAMADO');
    setFormTrainerId('');
    setIsDialogOpen(true);
  };

  const handleEdit = (taller: Taller) => {
    setEditingTaller(taller);
    setFormModalidad(taller.modalidad || '');
    setFormEstado(taller.estado || 'PROGRAMADO');
    setFormTrainerId(taller.trainerId || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este taller?')) return;

    try {
      await talleresApi.delete(id);
      await loadTalleres();
    } catch (err) {
      console.error('Error eliminando taller:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar el taller');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validar campos requeridos
    if (!formModalidad) {
      setError('La modalidad es requerida');
      setIsSubmitting(false);
      return;
    }

    if (!formTrainerId) {
      setError('El trainer es requerido');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const tema = formData.get("tema") as string;

    if (!tema) {
      setError('El tema es requerido');
      setIsSubmitting(false);
      return;
    }

    // Convertir fechas a formato ISO completo
    const fechaInicioRaw = formData.get("fechaInicio") as string;
    const fechaFinRaw = formData.get("fechaFin") as string;
    
    const fechaInicio = fechaInicioRaw 
      ? new Date(fechaInicioRaw).toISOString() 
      : undefined;
    const fechaFin = fechaFinRaw 
      ? new Date(fechaFinRaw).toISOString() 
      : undefined;

    try {
      if (editingTaller) {
        const updateData: UpdateTallerDto = {
          tema,
          modalidad: formModalidad,
          cupos: formData.get("cupos") ? Number(formData.get("cupos")) : undefined,
          fechaInicio,
          fechaFin,
          sede: formData.get("sede") as string || undefined,
          estado: formEstado,
          trainerId: formTrainerId,
        };
        await talleresApi.update(editingTaller.id, updateData);
      } else {
        const createData: CreateTallerDto = {
          tema,
          modalidad: formModalidad,
          cupos: formData.get("cupos") ? Number(formData.get("cupos")) : undefined,
          fechaInicio,
          fechaFin,
          sede: formData.get("sede") as string || undefined,
          estado: formEstado,
          trainerId: formTrainerId,
        };
        await talleresApi.create(createData);
      }
      setIsDialogOpen(false);
      await loadTalleres();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el taller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoBadgeVariant = (estado?: string) => {
    switch (estado) {
      case 'PROGRAMADO':
        return 'default';
      case 'EN_CURSO':
        return 'default';
      case 'FINALIZADO':
        return 'secondary';
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando talleres...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Talleres</h2>
          <p className="text-muted-foreground">Gestiona los talleres disponibles</p>
        </div>
        {canEdit && (
          <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTaller ? 'Editar Taller' : 'Nuevo Taller'}
                </DialogTitle>
                <DialogDescription>
                  {editingTaller
                    ? 'Modifica la información del taller'
                    : 'Completa los datos para crear un nuevo taller'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tema">Tema *</Label>
                    <Input
                      id="tema"
                      name="tema"
                      defaultValue={editingTaller?.tema}
                      required
                      placeholder="Ej: Marketing Digital"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modalidad">Modalidad *</Label>
                    <Select
                      value={formModalidad}
                      onValueChange={setFormModalidad}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                        <SelectItem value="VIRTUAL">Virtual</SelectItem>
                        <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="modalidad" value={formModalidad} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trainerId">Trainer *</Label>
                    <Select
                      value={formTrainerId}
                      onValueChange={setFormTrainerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.nombre} ({trainer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cupos">Cupos</Label>
                      <Input
                        id="cupos"
                        name="cupos"
                        type="number"
                        min="1"
                        defaultValue={editingTaller?.cupos}
                        placeholder="Ej: 30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formEstado}
                        onValueChange={setFormEstado}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROGRAMADO">Programado</SelectItem>
                          <SelectItem value="EN_CURSO">En Curso</SelectItem>
                          <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="estado" value={formEstado} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                      <Input
                        id="fechaInicio"
                        name="fechaInicio"
                        type="datetime-local"
                        defaultValue={
                          editingTaller?.fechaInicio
                            ? new Date(editingTaller.fechaInicio).toISOString().slice(0, 16)
                            : ''
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fechaFin">Fecha de Fin</Label>
                      <Input
                        id="fechaFin"
                        name="fechaFin"
                        type="datetime-local"
                        defaultValue={
                          editingTaller?.fechaFin
                            ? new Date(editingTaller.fechaFin).toISOString().slice(0, 16)
                            : ''
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sede">Sede</Label>
                    <Input
                      id="sede"
                      name="sede"
                      defaultValue={editingTaller?.sede}
                      placeholder="Ej: Sede Principal"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Guardando...'
                      : editingTaller
                      ? 'Actualizar'
                      : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Taller
          </Button>
        </>
        )}
      </div>

      {talleres.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay talleres registrados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talleres.map((taller) => (
            <Card 
              key={taller.id} 
              className={`hover:shadow-md transition-shadow ${isTrainer && onTallerClick ? 'cursor-pointer' : ''}`}
              onClick={() => isTrainer && onTallerClick && onTallerClick(taller)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{taller.tema}</CardTitle>
                  <Badge variant={getEstadoBadgeVariant(taller.estado)}>
                    {taller.estado || 'PROGRAMADO'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="w-4 h-4" />
                  {taller.modalidad}
                  {taller.sede && ` • ${taller.sede}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {taller.cupos && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {taller.cupos} cupos
                    </div>
                  )}
                  {taller.fechaInicio && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(taller.fechaInicio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                  {taller.trainer && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Trainer: {taller.trainer.nombre}
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(taller)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(taller.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
