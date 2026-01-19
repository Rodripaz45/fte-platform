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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  disponibilidadApi,
  type DisponibilidadTrainer,
  type CreateDisponibilidadDto,
  type UpdateDisponibilidadDto,
  type CargaTrabajoResponse,
  type SugerirTrainersResponse,
} from "@/lib/api/disponibilidad";
import { trainersApi, type Trainer } from "@/lib/api/trainers";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export default function DisponibilidadView() {
  const { user } = useAuth();
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadTrainer[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [cargaTrabajo, setCargaTrabajo] = useState<CargaTrabajoResponse | null>(null);
  const [sugerencias, setSugerencias] = useState<SugerirTrainersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSugerirDialogOpen, setIsSugerirDialogOpen] = useState(false);
  const [editingDisponibilidad, setEditingDisponibilidad] = useState<DisponibilidadTrainer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
  const [filtroTrainerId, setFiltroTrainerId] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");

  // Formulario de disponibilidad
  const [formDisponibilidad, setFormDisponibilidad] = useState<CreateDisponibilidadDto>({
    trainerId: "",
    fechaInicio: "",
    fechaFin: "",
    tipo: "DISPONIBLE",
    motivo: "",
  });

  // Formulario de sugerencias
  const [formSugerir, setFormSugerir] = useState({
    fechaInicio: "",
    fechaFin: "",
  });

  const isAdminOrDirector = user?.roles?.includes("ADMIN") || user?.roles?.includes("DIRECTOR");
  const isTrainer = user?.roles?.includes("TRAINER");
  const currentTrainerId = isTrainer ? user?.id : null;

  useEffect(() => {
    loadTrainers();
    if (isTrainer && currentTrainerId) {
      setSelectedTrainerId(currentTrainerId);
      setFiltroTrainerId(currentTrainerId);
      loadCargaTrabajo(currentTrainerId);
    }
  }, []);

  useEffect(() => {
    loadDisponibilidades();
  }, [filtroTrainerId, filtroTipo]);

  useEffect(() => {
    if (selectedTrainerId) {
      loadCargaTrabajo(selectedTrainerId);
    }
  }, [selectedTrainerId]);

  const loadTrainers = async () => {
    try {
      const data = await trainersApi.getAll();
      setTrainers(data);
    } catch (error: any) {
      console.error("Error cargando trainers:", error);
    }
  };

  const loadDisponibilidades = async () => {
    try {
      setIsLoading(true);
      const trainerId = filtroTrainerId || undefined;
      const inicio = startOfMonth(new Date());
      const fin = endOfMonth(new Date());
      
      const data = await disponibilidadApi.getAll(
        trainerId,
        inicio.toISOString(),
        fin.toISOString()
      );
      
      let filtered = data;
      if (filtroTipo !== "all") {
        filtered = data.filter((d) => d.tipo === filtroTipo);
      }
      
      setDisponibilidades(filtered);
    } catch (error: any) {
      setError(error.message || "Error al cargar disponibilidades");
      console.error("Error cargando disponibilidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCargaTrabajo = async (trainerId: string) => {
    try {
      const inicio = startOfMonth(new Date());
      const fin = endOfMonth(new Date());
      const data = await disponibilidadApi.obtenerCargaTrabajo(
        trainerId,
        inicio.toISOString(),
        fin.toISOString()
      );
      setCargaTrabajo(data);
    } catch (error: any) {
      console.error("Error cargando carga de trabajo:", error);
    }
  };

  const handleSugerirTrainers = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const data = await disponibilidadApi.sugerirTrainersDisponibles(
        formSugerir.fechaInicio,
        formSugerir.fechaFin
      );
      setSugerencias(data);
    } catch (error: any) {
      setError(error.message || "Error al sugerir trainers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await disponibilidadApi.create(formDisponibilidad);
      setIsDialogOpen(false);
      resetForm();
      await loadDisponibilidades();
      if (formDisponibilidad.trainerId) {
        await loadCargaTrabajo(formDisponibilidad.trainerId);
      }
    } catch (error: any) {
      setError(error.message || "Error al crear la disponibilidad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingDisponibilidad) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await disponibilidadApi.update(editingDisponibilidad.id, formDisponibilidad);
      setIsDialogOpen(false);
      setEditingDisponibilidad(null);
      resetForm();
      await loadDisponibilidades();
      if (formDisponibilidad.trainerId) {
        await loadCargaTrabajo(formDisponibilidad.trainerId);
      }
    } catch (error: any) {
      setError(error.message || "Error al actualizar la disponibilidad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta disponibilidad?")) return;
    try {
      await disponibilidadApi.delete(id);
      await loadDisponibilidades();
      if (selectedTrainerId) {
        await loadCargaTrabajo(selectedTrainerId);
      }
    } catch (error: any) {
      setError(error.message || "Error al eliminar la disponibilidad");
      alert(error.message || "Error al eliminar la disponibilidad");
    }
  };

  const resetForm = () => {
    setFormDisponibilidad({
      trainerId: currentTrainerId || "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "DISPONIBLE",
      motivo: "",
    });
  };

  const openEdit = (disponibilidad: DisponibilidadTrainer) => {
    setEditingDisponibilidad(disponibilidad);
    setFormDisponibilidad({
      trainerId: disponibilidad.trainerId,
      fechaInicio: disponibilidad.fechaInicio,
      fechaFin: disponibilidad.fechaFin,
      tipo: disponibilidad.tipo as any,
      motivo: disponibilidad.motivo || "",
    });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingDisponibilidad(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "DISPONIBLE":
        return <Badge className="bg-green-500">Disponible</Badge>;
      case "NO_DISPONIBLE":
        return <Badge className="bg-red-500">No Disponible</Badge>;
      case "OCUPADO":
        return <Badge className="bg-orange-500">Ocupado</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "DISPONIBLE":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "NO_DISPONIBLE":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "OCUPADO":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (isDialogOpen && !editingDisponibilidad) {
      resetForm();
    }
  }, [isDialogOpen, editingDisponibilidad]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="disponibilidades" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="disponibilidades">
              <Clock className="w-4 h-4 mr-2" />
              Disponibilidades
            </TabsTrigger>
            {isAdminOrDirector && (
              <TabsTrigger value="sugerir">
                <Users className="w-4 h-4 mr-2" />
                Sugerir Trainers
              </TabsTrigger>
            )}
            {selectedTrainerId && (
              <TabsTrigger value="carga">
                <TrendingUp className="w-4 h-4 mr-2" />
                Carga de Trabajo
              </TabsTrigger>
            )}
          </TabsList>
          <div className="flex gap-2">
            {isAdminOrDirector && (
              <Button type="button" variant="outline" onClick={() => setIsSugerirDialogOpen(true)}>
                <Search className="w-4 h-4 mr-2" />
                Buscar Disponibles
              </Button>
            )}
            <Button type="button" onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Disponibilidad
            </Button>
          </div>
        </div>

        <TabsContent value="disponibilidades" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAdminOrDirector && (
                  <div>
                    <Label>Trainer</Label>
                    <Select value={filtroTrainerId} onValueChange={setFiltroTrainerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los trainers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los trainers</SelectItem>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.nombre} ({trainer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Tipo</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                      <SelectItem value="NO_DISPONIBLE">No Disponible</SelectItem>
                      <SelectItem value="OCUPADO">Ocupado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de disponibilidades */}
          {isLoading ? (
            <div className="text-center py-8">Cargando disponibilidades...</div>
          ) : disponibilidades.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay disponibilidades registradas
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {disponibilidades.map((disponibilidad) => (
                <Card key={disponibilidad.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTipoIcon(disponibilidad.tipo)}
                          <span className="font-semibold">
                            {disponibilidad.trainer?.nombre || "Trainer no encontrado"}
                          </span>
                          {getTipoBadge(disponibilidad.tipo)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {(() => {
                              try {
                                return `${format(parseISO(disponibilidad.fechaInicio), "PPpp", { locale: es })} - ${format(parseISO(disponibilidad.fechaFin), "PPpp", { locale: es })}`;
                              } catch {
                                return `${disponibilidad.fechaInicio} - ${disponibilidad.fechaFin}`;
                              }
                            })()}
                          </div>
                          {disponibilidad.motivo && (
                            <div className="mt-2 p-2 bg-muted rounded">
                              <strong>Motivo:</strong> {disponibilidad.motivo}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(disponibilidad)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(disponibilidad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isAdminOrDirector && (
          <TabsContent value="sugerir" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Trainers Disponibles</CardTitle>
                <CardDescription>
                  Ingresa un rango de fechas para encontrar trainers disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <Input
                      type="datetime-local"
                      value={formSugerir.fechaInicio}
                      onChange={(e) =>
                        setFormSugerir({ ...formSugerir, fechaInicio: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fecha de Fin</Label>
                    <Input
                      type="datetime-local"
                      value={formSugerir.fechaFin}
                      onChange={(e) =>
                        setFormSugerir({ ...formSugerir, fechaFin: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSugerirTrainers}
                  disabled={!formSugerir.fechaInicio || !formSugerir.fechaFin || isSubmitting}
                >
                  {isSubmitting ? "Buscando..." : "Buscar Trainers Disponibles"}
                </Button>
              </CardContent>
            </Card>

            {sugerencias && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Resultados: {sugerencias.disponibles} disponibles, {sugerencias.noDisponibles} no disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sugerencias.trainers.map((item) => (
                      <Card key={item.trainer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {item.disponible ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <span className="font-semibold">{item.trainer.nombre}</span>
                                <Badge variant={item.disponible ? "default" : "outline"}>
                                  {item.disponible ? "Disponible" : "No Disponible"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.trainer.email}
                              </div>
                              {item.cargaTrabajo && (
                                <div className="mt-2 text-sm">
                                  <div className="font-medium">Carga de trabajo:</div>
                                  <div className="text-muted-foreground">
                                    {item.cargaTrabajo.totalSesiones} sesiones, {item.cargaTrabajo.totalTalleres} talleres
                                  </div>
                                </div>
                              )}
                              {item.conflictos && !item.disponible && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                                  <div className="font-medium text-red-700">Conflictos detectados:</div>
                                  {item.conflictos.conflictosDisponibilidad.length > 0 && (
                                    <div className="text-red-600">
                                      {item.conflictos.conflictosDisponibilidad.length} disponibilidades en conflicto
                                    </div>
                                  )}
                                  {item.conflictos.conflictosSesiones.length > 0 && (
                                    <div className="text-red-600">
                                      {item.conflictos.conflictosSesiones.length} sesiones en conflicto
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {selectedTrainerId && (
          <TabsContent value="carga" className="space-y-4">
            {cargaTrabajo ? (
              <Card>
                <CardHeader>
                  <CardTitle>Carga de Trabajo</CardTitle>
                  <CardDescription>
                    {cargaTrabajo.trainer.nombre} ({cargaTrabajo.trainer.email})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">{cargaTrabajo.estadisticas.totalSesiones}</div>
                      <div className="text-sm text-muted-foreground">Sesiones</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">{cargaTrabajo.estadisticas.totalTalleres}</div>
                      <div className="text-sm text-muted-foreground">Talleres</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">{cargaTrabajo.estadisticas.diasNoDisponibles}</div>
                      <div className="text-sm text-muted-foreground">Días No Disponibles</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Selecciona un trainer para ver su carga de trabajo
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog para crear/editar disponibilidad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDisponibilidad ? "Editar Disponibilidad" : "Nueva Disponibilidad"}
            </DialogTitle>
            <DialogDescription>
              {editingDisponibilidad
                ? "Modifica la información de disponibilidad"
                : "Completa los datos para crear una nueva disponibilidad"}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {isAdminOrDirector && (
              <div>
                <Label htmlFor="trainerId">Trainer *</Label>
                <Select
                  value={formDisponibilidad.trainerId}
                  onValueChange={(value) =>
                    setFormDisponibilidad({ ...formDisponibilidad, trainerId: value })
                  }
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
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha y Hora de Inicio *</Label>
                <Input
                  id="fechaInicio"
                  type="datetime-local"
                  value={formDisponibilidad.fechaInicio}
                  onChange={(e) =>
                    setFormDisponibilidad({ ...formDisponibilidad, fechaInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha y Hora de Fin *</Label>
                <Input
                  id="fechaFin"
                  type="datetime-local"
                  value={formDisponibilidad.fechaFin}
                  onChange={(e) =>
                    setFormDisponibilidad({ ...formDisponibilidad, fechaFin: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formDisponibilidad.tipo}
                onValueChange={(value: any) =>
                  setFormDisponibilidad({ ...formDisponibilidad, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="NO_DISPONIBLE">No Disponible</SelectItem>
                  <SelectItem value="OCUPADO">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                value={formDisponibilidad.motivo}
                onChange={(e) =>
                  setFormDisponibilidad({ ...formDisponibilidad, motivo: e.target.value })
                }
                placeholder="Motivo de la disponibilidad o no disponibilidad"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingDisponibilidad(null);
                resetForm();
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingDisponibilidad) {
                  handleUpdate();
                } else {
                  handleCreate();
                }
              }}
              disabled={
                isSubmitting ||
                !formDisponibilidad.trainerId ||
                !formDisponibilidad.fechaInicio ||
                !formDisponibilidad.fechaFin
              }
            >
              {isSubmitting
                ? "Guardando..."
                : editingDisponibilidad
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para sugerir trainers */}
      <Dialog open={isSugerirDialogOpen} onOpenChange={setIsSugerirDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buscar Trainers Disponibles</DialogTitle>
            <DialogDescription>
              Ingresa un rango de fechas para encontrar trainers disponibles
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Inicio</Label>
                <Input
                  type="datetime-local"
                  value={formSugerir.fechaInicio}
                  onChange={(e) =>
                    setFormSugerir({ ...formSugerir, fechaInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Fecha de Fin</Label>
                <Input
                  type="datetime-local"
                  value={formSugerir.fechaFin}
                  onChange={(e) =>
                    setFormSugerir({ ...formSugerir, fechaFin: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSugerirDialogOpen(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSugerirTrainers}
              disabled={!formSugerir.fechaInicio || !formSugerir.fechaFin || isSubmitting}
            >
              {isSubmitting ? "Buscando..." : "Buscar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

