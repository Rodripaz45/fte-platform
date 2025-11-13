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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { sesionesApi, type Sesion, type CreateSesionDto, type UpdateSesionDto } from "@/lib/api/sesiones";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { usePolling } from "@/hooks/usePolling";

interface SesionesViewProps {
  defaultTallerId?: string;
}

export default function SesionesView({ defaultTallerId }: SesionesViewProps) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState<Sesion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTallerId, setSelectedTallerId] = useState<string>(defaultTallerId || '');

  useEffect(() => {
    loadTalleres();
    if (defaultTallerId) {
      loadSesiones(defaultTallerId);
      setSelectedTallerId(defaultTallerId);
    } else {
      loadSesiones();
    }
  }, [defaultTallerId]);

  useEffect(() => {
    if (selectedTallerId && !defaultTallerId) {
      loadSesiones(selectedTallerId);
    } else if (!selectedTallerId && !defaultTallerId) {
      loadSesiones();
    }
  }, [selectedTallerId]);

  // Polling de sesiones cada 30 segundos
  usePolling(() => {
    if (selectedTallerId && !defaultTallerId) {
      loadSesiones(selectedTallerId);
    } else if (!selectedTallerId && !defaultTallerId) {
      loadSesiones();
    } else if (defaultTallerId) {
      loadSesiones(defaultTallerId);
    }
  }, { interval: 30000 });

  const loadTalleres = async () => {
    try {
      const data = await talleresApi.getAll();
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres:', err);
    }
  };

  const loadSesiones = async (tallerId?: string) => {
    try {
      setIsLoading(true);
      const params = tallerId ? { tallerId } : undefined;
      const response = await sesionesApi.getAll(params);
      setSesiones(response.items || []);
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSesion(null);
    setSelectedTallerId('');
    setIsDialogOpen(true);
  };

  const handleEdit = (sesion: Sesion) => {
    setEditingSesion(sesion);
    setSelectedTallerId(sesion.tallerId);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sesión?')) return;

    try {
      await sesionesApi.delete(id);
      await loadSesiones(selectedTallerId || undefined);
    } catch (err) {
      console.error('Error eliminando sesión:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar la sesión');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const tallerId = formData.get("tallerId") as string;
    const fechaRaw = formData.get("fecha") as string;
    const horaInicioRaw = formData.get("horaInicio") as string;
    const horaFinRaw = formData.get("horaFin") as string;

    if (!tallerId) {
      setError('El taller es requerido');
      setIsSubmitting(false);
      return;
    }

    if (!fechaRaw) {
      setError('La fecha es requerida');
      setIsSubmitting(false);
      return;
    }

    // Convertir fechas a formato ISO
    const fecha = new Date(fechaRaw).toISOString();
    const horaInicio = horaInicioRaw ? new Date(`${fechaRaw}T${horaInicioRaw}`).toISOString() : undefined;
    const horaFin = horaFinRaw ? new Date(`${fechaRaw}T${horaFinRaw}`).toISOString() : undefined;

    try {
      if (editingSesion) {
        const updateData: UpdateSesionDto = {
          tallerId,
          fecha,
          horaInicio,
          horaFin,
        };
        await sesionesApi.update(editingSesion.id, updateData);
      } else {
        const createData: CreateSesionDto = {
          tallerId,
          fecha,
          horaInicio,
          horaFin,
        };
        await sesionesApi.create(createData);
      }
      setIsDialogOpen(false);
      await loadSesiones(selectedTallerId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sesiones</h2>
          <p className="text-muted-foreground">Gestiona las sesiones de los talleres</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      {/* Filtro por taller - Solo mostrar si no hay defaultTallerId */}
      {!defaultTallerId && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="taller-filter">Filtrar por Taller</Label>
                <Select value={selectedTallerId} onValueChange={setSelectedTallerId}>
                  <SelectTrigger id="taller-filter">
                    <SelectValue placeholder="Todos los talleres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los talleres</SelectItem>
                    {talleres.map((taller) => (
                      <SelectItem key={taller.id} value={taller.id}>
                        {taller.tema}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando sesiones...</div>
      ) : sesiones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay sesiones registradas
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sesiones.map((sesion) => (
            <Card key={sesion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{sesion.taller?.tema || 'Sin taller'}</CardTitle>
                    <div className="mt-1">
                      <Badge variant="outline" className="mr-2">
                        {sesion.taller?.modalidad || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sesion)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sesion.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(sesion.fecha)}</span>
                </div>
                {sesion.horaInicio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {formatTime(sesion.horaInicio)}
                      {sesion.horaFin && ` - ${formatTime(sesion.horaFin)}`}
                    </span>
                  </div>
                )}
                {sesion.responsable && (
                  <div className="text-sm text-muted-foreground">
                    Responsable: {sesion.responsable.nombre}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear/editar sesión */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSesion ? 'Editar Sesión' : 'Nueva Sesión'}
            </DialogTitle>
            <DialogDescription>
              {editingSesion
                ? 'Modifica los datos de la sesión'
                : 'Completa los datos para crear una nueva sesión'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tallerId">Taller *</Label>
                <Select
                  value={selectedTallerId}
                  onValueChange={setSelectedTallerId}
                >
                  <SelectTrigger id="tallerId">
                    <SelectValue placeholder="Selecciona un taller" />
                  </SelectTrigger>
                  <SelectContent>
                    {talleres.map((taller) => (
                      <SelectItem key={taller.id} value={taller.id}>
                        {taller.tema} - {taller.modalidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="tallerId" value={selectedTallerId} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  defaultValue={editingSesion ? getDateTimeLocal(editingSesion.fecha) : ''}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora de Inicio</Label>
                  <Input
                    id="horaInicio"
                    name="horaInicio"
                    type="time"
                    defaultValue={editingSesion ? getTimeLocal(editingSesion.horaInicio) : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora de Fin</Label>
                  <Input
                    id="horaFin"
                    name="horaFin"
                    type="time"
                    defaultValue={editingSesion ? getTimeLocal(editingSesion.horaFin) : ''}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingSesion ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

