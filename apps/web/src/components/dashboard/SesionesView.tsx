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
import { Plus, Edit, Trash2, Calendar, Clock, Building2 } from "lucide-react";
import { sesionesApi, type Sesion, type CreateSesionDto, type UpdateSesionDto } from "@/lib/api/sesiones";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { recursosApi, type Sala } from "@/lib/api/recursos";
import { usePolling } from "@/hooks/usePolling";

interface SesionesViewProps {
  defaultTallerId?: string;
}

export default function SesionesView({ defaultTallerId }: SesionesViewProps) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState<Sesion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTallerId, setSelectedTallerId] = useState<string>(defaultTallerId || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [diasRecurrentes, setDiasRecurrentes] = useState<string[]>([
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
  ]);

  useEffect(() => {
    loadTalleres();
    loadSalas();
    if (defaultTallerId) {
      loadSesiones(defaultTallerId);
      setSelectedTallerId(defaultTallerId);
    } else {
      loadSesiones();
    }
  }, [defaultTallerId]);

  const loadSalas = async () => {
    try {
      const data = await recursosApi.getAllSalas(undefined, true); // Solo salas activas
      setSalas(data);
    } catch (err) {
      console.error('Error cargando salas:', err);
    }
  };

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
      loadSesionesSilent(selectedTallerId);
    } else if (!selectedTallerId && !defaultTallerId) {
      loadSesionesSilent();
    } else if (defaultTallerId) {
      loadSesionesSilent(defaultTallerId);
    }
  }, { interval: 30000, pauseWhenDialogOpen: true });

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

  const loadSesionesSilent = async (tallerId?: string) => {
    try {
      const params = tallerId ? { tallerId } : undefined;
      const response = await sesionesApi.getAll(params);
      setSesiones(response.items || []);
    } catch (err) {
      console.error('Error cargando sesiones (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const handleCreate = () => {
    setEditingSesion(null);
    // Si hay un defaultTallerId, usarlo automáticamente
    setSelectedTallerId(defaultTallerId || '');
    setIsRecurring(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (sesion: Sesion) => {
    setEditingSesion(sesion);
    setSelectedTallerId(sesion.tallerId);
    setIsRecurring(false);
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
    // Usar defaultTallerId si existe, sino el del formulario
    const tallerId = defaultTallerId || (formData.get("tallerId") as string);
    const fechaRaw = formData.get("fecha") as string;
    const horaInicioRaw = formData.get("horaInicio") as string;
    const horaFinRaw = formData.get("horaFin") as string;
    const salaId = (formData.get("salaId") as string) || undefined;

    if (!tallerId) {
      setError('El taller es requerido');
      setIsSubmitting(false);
      return;
    }

    // Validaciones y payload según modo
    if (isRecurring) {
      if (!selectedTaller?.fechaInicio || !selectedTaller?.fechaFin) {
        setError('El taller debe tener fecha de inicio y fin para crear sesiones repetitivas');
        setIsSubmitting(false);
        return;
      }

      if (!diasRecurrentes.length) {
        setError('Selecciona al menos un día de la semana');
        setIsSubmitting(false);
        return;
      }

      const fechaInicioTaller = getDateTimeLocal(selectedTaller.fechaInicio);
      const fechaFinTaller = getDateTimeLocal(selectedTaller.fechaFin);

      if (!fechaInicioTaller || !fechaFinTaller) {
        setError('No se pudo obtener el rango de fechas del taller');
        setIsSubmitting(false);
        return;
      }

      if (new Date(fechaFinTaller) < new Date(fechaInicioTaller)) {
        setError('La fecha fin del taller debe ser mayor o igual a la fecha inicio');
        setIsSubmitting(false);
        return;
      }

      const horaInicio = horaInicioRaw && fechaInicioTaller
        ? `${fechaInicioTaller}T${horaInicioRaw}:00`
        : undefined;

      const horaFin = horaFinRaw && fechaInicioTaller
        ? `${fechaInicioTaller}T${horaFinRaw}:00`
        : undefined;

      try {
        await sesionesApi.createRecurrentes({
          tallerId,
          fechaInicio: `${fechaInicioTaller}T00:00:00`,
          fechaFin: `${fechaFinTaller}T00:00:00`,
          diasSemana: diasRecurrentes,
          horaInicio,
          horaFin,
          salaId: salaId || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar las sesiones');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!fechaRaw) {
        setError('La fecha es requerida');
        setIsSubmitting(false);
        return;
      }

      const fecha = `${fechaRaw}T00:00:00`;
      
      const horaInicio = horaInicioRaw && fechaRaw
        ? `${fechaRaw}T${horaInicioRaw}:00`
        : undefined;
      
      const horaFin = horaFinRaw && fechaRaw
        ? `${fechaRaw}T${horaFinRaw}:00`
        : undefined;

      try {
        if (editingSesion) {
          const updateData: UpdateSesionDto = {
            tallerId,
            fecha,
            horaInicio,
            horaFin,
            salaId: salaId || undefined,
          };
          await sesionesApi.update(editingSesion.id, updateData);
        } else {
          const createData: CreateSesionDto = {
            tallerId,
            fecha,
            horaInicio,
            horaFin,
            salaId: salaId || undefined,
          };
          await sesionesApi.create(createData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar la sesión');
        setIsSubmitting(false);
        return;
      }
    }

    setIsDialogOpen(false);
    await loadSesiones(selectedTallerId || undefined);
    setIsSubmitting(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    // Extraer solo la parte de la fecha para evitar problemas de zona horaria
    let date: Date;
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
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
    // Si la fecha viene en formato ISO, extraer solo la parte de la fecha (YYYY-MM-DD)
    // Esto evita problemas de zona horaria
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      return datePart;
    }
    // Si no viene en formato ISO, usar métodos UTC para evitar problemas de zona horaria
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Obtener el taller seleccionado
  const selectedTaller = talleres.find(t => t.id === (defaultTallerId || selectedTallerId));

  const toggleDia = (dia: string) => {
    setDiasRecurrentes((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const diasSemanaOptions = [
    { value: 'LUNES', label: 'L' },
    { value: 'MARTES', label: 'M' },
    { value: 'MIERCOLES', label: 'X' },
    { value: 'JUEVES', label: 'J' },
    { value: 'VIERNES', label: 'V' },
    { value: 'SABADO', label: 'S' },
    { value: 'DOMINGO', label: 'D' },
  ];

  // Para mostrar el período del taller en el modal de sesión,
  // usamos el mismo criterio que en el detalle del taller:
  // inicio a 00:00 y fin a 23:59 (solo informativo)
  const formatTallerPeriodDateTime = (dateString?: string, isEnd?: boolean) => {
    if (!dateString) return null;

    let year: number;
    let month: number;
    let day: number;

    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      [year, month, day] = datePart.split('-').map(Number);
    } else {
      const d = new Date(dateString);
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }

    const date = new Date(year, month - 1, day);
    const datePartFormatted = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timePart = isEnd ? '23:59' : '00:00';
    return `${datePartFormatted}, ${timePart}`;
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
                {sesion.sala && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{sesion.sala.nombre} - {sesion.sala.sede}</span>
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
                <div className="flex items-center gap-2">
                  <input
                    id="recurring"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(ev) => setIsRecurring(ev.target.checked)}
                  />
                  <Label htmlFor="recurring">Crear sesiones repetitivas</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tallerId">Taller *</Label>
                {defaultTallerId ? (
                  // Si hay un defaultTallerId, mostrar el taller seleccionado pero deshabilitado
                  <Input
                    id="tallerId"
                    value={talleres.find(t => t.id === defaultTallerId)?.tema || 'Taller seleccionado'}
                    disabled
                  />
                ) : (
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
                )}
                <input type="hidden" name="tallerId" value={defaultTallerId || selectedTallerId} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">
                  {isRecurring ? 'Rango de fechas *' : 'Fecha *'}
                </Label>
                {/* Mostrar fechas del taller si hay un taller seleccionado */}
                {selectedTaller && (selectedTaller.fechaInicio || selectedTaller.fechaFin) && (
                  <div className="mb-2 p-3 bg-muted rounded-md text-sm">
                    <div className="font-medium mb-1">Período del taller:</div>
                    <div className="space-y-1 text-muted-foreground">
                      {selectedTaller.fechaInicio && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Inicio: {formatTallerPeriodDateTime(selectedTaller.fechaInicio)}</span>
                        </div>
                      )}
                      {selectedTaller.fechaFin && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Fin: {formatTallerPeriodDateTime(selectedTaller.fechaFin, true)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isRecurring ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Se usará automáticamente el rango de fechas del taller (inicio y fin) y se crearán
                      sesiones en los días seleccionados.
                    </p>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm">Días de la semana</Label>
                      <div className="flex flex-wrap gap-2">
                        {diasSemanaOptions.map((d) => {
                          const active = diasRecurrentes.includes(d.value);
                          return (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleDia(d.value)}
                              className={`px-3 py-2 rounded-md border text-sm transition ${
                                active
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    defaultValue={editingSesion ? getDateTimeLocal(editingSesion.fecha) : ''}
                    required
                  />
                )}
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

              <div className="space-y-2">
                <Label htmlFor="salaId">Sala (Opcional - para sesiones presenciales)</Label>
                <Select
                  name="salaId"
                  defaultValue={editingSesion?.salaId || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sala (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin sala (sesión virtual)</SelectItem>
                    {salas.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id}>
                        {sala.nombre} - {sala.sede} (Cap: {sala.capacidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Si seleccionas una sala, se creará automáticamente una reserva para esta sesión
                </p>
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

