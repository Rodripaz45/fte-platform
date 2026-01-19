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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  recursosApi,
  type Sala,
  type ReservaSala,
  type CreateSalaDto,
  type UpdateSalaDto,
  type CreateReservaSalaDto,
  type UpdateReservaSalaDto,
} from "@/lib/api/recursos";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import CalendarioSalaView from "./CalendarioSalaView";

export default function RecursosView() {
  const { user } = useAuth();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<ReservaSala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSalaDialogOpen, setIsSalaDialogOpen] = useState(false);
  const [isReservaDialogOpen, setIsReservaDialogOpen] = useState(false);
  const [isCalendarioSalaOpen, setIsCalendarioSalaOpen] = useState(false);
  const [salaParaCalendario, setSalaParaCalendario] = useState<Sala | null>(null);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editingReserva, setEditingReserva] = useState<ReservaSala | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroSede, setFiltroSede] = useState<string>("");
  const [filtroActiva, setFiltroActiva] = useState<string>("all");

  // Formulario de sala
  const [formSala, setFormSala] = useState<CreateSalaDto>({
    nombre: "",
    sede: "",
    capacidad: 10,
    equipamiento: "",
    descripcion: "",
    activa: true,
  });

  // Formulario de reserva
  const [formReserva, setFormReserva] = useState<CreateReservaSalaDto>({
    salaId: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "RESERVADA",
    motivo: "",
  });

  const isAdminOrDirector = user?.roles?.includes("ADMIN") || user?.roles?.includes("DIRECTOR");

  useEffect(() => {
    loadSalas();
    loadReservas();
  }, [filtroSede, filtroActiva]);

  useEffect(() => {
    if (isSalaDialogOpen && !editingSala) {
      // Si se abre el diálogo sin editar, es una nueva sala
      resetFormSala();
    }
  }, [isSalaDialogOpen, editingSala]);

  useEffect(() => {
    if (isReservaDialogOpen && !editingReserva) {
      // Si se abre el diálogo sin editar, es una nueva reserva
      resetFormReserva();
    }
  }, [isReservaDialogOpen, editingReserva]);

  const loadSalas = async () => {
    try {
      setIsLoading(true);
      const activa = filtroActiva === "all" ? undefined : filtroActiva === "true";
      const data = await recursosApi.getAllSalas(filtroSede || undefined, activa);
      setSalas(data);
    } catch (error: any) {
      setError(error.message || "Error al cargar salas");
      console.error("Error cargando salas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReservas = async () => {
    try {
      const data = await recursosApi.getAllReservas();
      setReservas(data);
    } catch (error: any) {
      console.error("Error cargando reservas:", error);
    }
  };

  const handleCreateSala = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await recursosApi.createSala(formSala);
      setIsSalaDialogOpen(false);
      resetFormSala();
      await loadSalas();
    } catch (error: any) {
      setError(error.message || "Error al crear la sala");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSala = async () => {
    if (!editingSala) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await recursosApi.updateSala(editingSala.id, formSala);
      setIsSalaDialogOpen(false);
      setEditingSala(null);
      resetFormSala();
      await loadSalas();
    } catch (error: any) {
      setError(error.message || "Error al actualizar la sala");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSala = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sala?")) return;
    try {
      await recursosApi.deleteSala(id);
      await loadSalas();
    } catch (error: any) {
      setError(error.message || "Error al eliminar la sala");
      alert(error.message || "Error al eliminar la sala");
    }
  };

  const handleCreateReserva = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await recursosApi.createReserva(formReserva);
      setIsReservaDialogOpen(false);
      resetFormReserva();
      await loadReservas();
    } catch (error: any) {
      setError(error.message || "Error al crear la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReserva = async () => {
    if (!editingReserva) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await recursosApi.updateReserva(editingReserva.id, formReserva);
      setIsReservaDialogOpen(false);
      setEditingReserva(null);
      resetFormReserva();
      await loadReservas();
    } catch (error: any) {
      setError(error.message || "Error al actualizar la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReserva = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;
    try {
      await recursosApi.deleteReserva(id);
      await loadReservas();
    } catch (error: any) {
      setError(error.message || "Error al eliminar la reserva");
      alert(error.message || "Error al eliminar la reserva");
    }
  };

  const resetFormSala = () => {
    setFormSala({
      nombre: "",
      sede: "",
      capacidad: 10,
      equipamiento: "",
      descripcion: "",
      activa: true,
    });
  };

  const resetFormReserva = () => {
    setFormReserva({
      salaId: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "RESERVADA",
      motivo: "",
    });
  };

  const openEditSala = (sala: Sala) => {
    setEditingSala(sala);
    setFormSala({
      nombre: sala.nombre,
      sede: sala.sede,
      capacidad: sala.capacidad,
      equipamiento: sala.equipamiento || "",
      descripcion: sala.descripcion || "",
      activa: sala.activa,
    });
    setIsSalaDialogOpen(true);
  };

  const openEditReserva = (reserva: ReservaSala) => {
    setEditingReserva(reserva);
    setFormReserva({
      salaId: reserva.salaId,
      sesionId: reserva.sesionId,
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin,
      estado: reserva.estado,
      motivo: reserva.motivo || "",
    });
    setIsReservaDialogOpen(true);
  };

  const openNewSala = () => {
    setEditingSala(null);
    resetFormSala();
    setIsSalaDialogOpen(true);
  };

  const openNewReserva = () => {
    setEditingReserva(null);
    resetFormReserva();
    setIsReservaDialogOpen(true);
  };


  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "CONFIRMADA":
        return <Badge className="bg-green-500">Confirmada</Badge>;
      case "RESERVADA":
        return <Badge className="bg-blue-500">Reservada</Badge>;
      case "CANCELADA":
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const sedesUnicas = Array.from(new Set(salas.map((s) => s.sede)));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="salas" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="salas">
              <Building2 className="w-4 h-4 mr-2" />
              Salas
            </TabsTrigger>
            <TabsTrigger value="reservas">
              <Calendar className="w-4 h-4 mr-2" />
              Reservas
            </TabsTrigger>
          </TabsList>
          {isAdminOrDirector && (
            <div className="flex gap-2">
              <Dialog open={isSalaDialogOpen} onOpenChange={setIsSalaDialogOpen}>
                <Button type="button" onClick={openNewSala}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Sala
                </Button>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSala ? "Editar Sala" : "Nueva Sala"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSala
                        ? "Modifica la información de la sala"
                        : "Completa los datos para crear una nueva sala"}
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
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formSala.nombre}
                          onChange={(e) =>
                            setFormSala({ ...formSala, nombre: e.target.value })
                          }
                          placeholder="Ej: Sala A, Auditorio Principal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sede">Sede *</Label>
                        <Input
                          id="sede"
                          value={formSala.sede}
                          onChange={(e) =>
                            setFormSala({ ...formSala, sede: e.target.value })
                          }
                          placeholder="Ej: Sede Central, Sede Norte"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="capacidad">Capacidad *</Label>
                      <Input
                        id="capacidad"
                        type="number"
                        min="1"
                        value={formSala.capacidad}
                        onChange={(e) =>
                          setFormSala({
                            ...formSala,
                            capacidad: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipamiento">Equipamiento</Label>
                      <Textarea
                        id="equipamiento"
                        value={formSala.equipamiento}
                        onChange={(e) =>
                          setFormSala({ ...formSala, equipamiento: e.target.value })
                        }
                        placeholder="Ej: Proyector, Pizarra, Computadoras..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formSala.descripcion}
                        onChange={(e) =>
                          setFormSala({ ...formSala, descripcion: e.target.value })
                        }
                        placeholder="Descripción adicional de la sala"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="activa"
                        checked={formSala.activa}
                        onChange={(e) =>
                          setFormSala({ ...formSala, activa: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="activa">Sala activa</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSalaDialogOpen(false);
                        setEditingSala(null);
                        resetFormSala();
                        setError(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingSala) {
                          handleUpdateSala();
                        } else {
                          handleCreateSala();
                        }
                      }}
                      disabled={isSubmitting || !formSala.nombre || !formSala.sede}
                    >
                      {isSubmitting
                        ? "Guardando..."
                        : editingSala
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isReservaDialogOpen} onOpenChange={setIsReservaDialogOpen}>
                <Button type="button" variant="outline" onClick={openNewReserva}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Reserva
                </Button>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingReserva
                        ? "Modifica la información de la reserva"
                        : "Completa los datos para crear una nueva reserva"}
                    </DialogDescription>
                  </DialogHeader>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="salaId">Sala *</Label>
                      <Select
                        value={formReserva.salaId}
                        onValueChange={(value) =>
                          setFormReserva({ ...formReserva, salaId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una sala" />
                        </SelectTrigger>
                        <SelectContent>
                          {salas
                            .filter((s) => s.activa)
                            .map((sala) => (
                              <SelectItem key={sala.id} value={sala.id}>
                                {sala.nombre} - {sala.sede} (Cap: {sala.capacidad})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fechaInicio">Fecha y Hora de Inicio *</Label>
                        <Input
                          id="fechaInicio"
                          type="datetime-local"
                          value={formReserva.fechaInicio}
                          onChange={(e) =>
                            setFormReserva({ ...formReserva, fechaInicio: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaFin">Fecha y Hora de Fin *</Label>
                        <Input
                          id="fechaFin"
                          type="datetime-local"
                          value={formReserva.fechaFin}
                          onChange={(e) =>
                            setFormReserva({ ...formReserva, fechaFin: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formReserva.estado}
                        onValueChange={(value: any) =>
                          setFormReserva({ ...formReserva, estado: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESERVADA">Reservada</SelectItem>
                          <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                          <SelectItem value="CANCELADA">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="motivo">Motivo</Label>
                      <Textarea
                        id="motivo"
                        value={formReserva.motivo}
                        onChange={(e) =>
                          setFormReserva({ ...formReserva, motivo: e.target.value })
                        }
                        placeholder="Motivo de la reserva o bloqueo"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsReservaDialogOpen(false);
                        setEditingReserva(null);
                        resetFormReserva();
                        setError(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingReserva) {
                          handleUpdateReserva();
                        } else {
                          handleCreateReserva();
                        }
                      }}
                      disabled={
                        isSubmitting ||
                        !formReserva.salaId ||
                        !formReserva.fechaInicio ||
                        !formReserva.fechaFin
                      }
                    >
                      {isSubmitting
                        ? "Guardando..."
                        : editingReserva
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <TabsContent value="salas" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sede</Label>
                  <Select value={filtroSede} onValueChange={setFiltroSede}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las sedes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las sedes</SelectItem>
                      {sedesUnicas.map((sede) => (
                        <SelectItem key={sede} value={sede}>
                          {sede}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={filtroActiva} onValueChange={setFiltroActiva}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="true">Activas</SelectItem>
                      <SelectItem value="false">Inactivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de salas */}
          {isLoading ? (
            <div className="text-center py-8">Cargando salas...</div>
          ) : salas.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay salas registradas
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salas.map((sala) => (
                <Card key={sala.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {sala.nombre}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {sala.sede}
                        </CardDescription>
                      </div>
                      {sala.activa ? (
                        <Badge className="bg-green-500">Activa</Badge>
                      ) : (
                        <Badge variant="outline">Inactiva</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Capacidad: {sala.capacidad} personas</span>
                      </div>
                      {sala.equipamiento && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Equipamiento:</strong> {sala.equipamiento}
                        </div>
                      )}
                      {sala.descripcion && (
                        <div className="text-sm text-muted-foreground">
                          {sala.descripcion}
                        </div>
                      )}
                      {sala._count && (
                        <div className="text-sm text-muted-foreground">
                          {sala._count.sesiones} sesiones, {sala._count.reservas} reservas
                        </div>
                      )}
                    </div>
                    {isAdminOrDirector && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSalaParaCalendario(sala);
                            setIsCalendarioSalaOpen(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Ver Calendario
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSala(sala)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSala(sala.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservas" className="space-y-4">
          {reservas.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay reservas registradas
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservas.map((reserva) => (
                <Card key={reserva.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {reserva.sala?.nombre || "Sala no encontrada"}
                          </span>
                          {getEstadoBadge(reserva.estado)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {reserva.sala?.sede}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {(() => {
                              try {
                                return `${format(parseISO(reserva.fechaInicio), "PPpp", { locale: es })} - ${format(parseISO(reserva.fechaFin), "PPpp", { locale: es })}`;
                              } catch {
                                return `${reserva.fechaInicio} - ${reserva.fechaFin}`;
                              }
                            })()}
                          </div>
                          {reserva.sesion && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Sesión: {reserva.sesion.taller?.tema || "N/A"}
                            </div>
                          )}
                          {reserva.motivo && (
                            <div className="mt-2 p-2 bg-muted rounded">
                              <strong>Motivo:</strong> {reserva.motivo}
                            </div>
                          )}
                        </div>
                      </div>
                      {isAdminOrDirector && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditReserva(reserva)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReserva(reserva.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Calendario de Sala */}
      {salaParaCalendario && (
        <Dialog open={isCalendarioSalaOpen} onOpenChange={setIsCalendarioSalaOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Calendario de Uso - {salaParaCalendario.nombre}</DialogTitle>
              <DialogDescription>
                Visualiza las reservas y sesiones programadas para esta sala
              </DialogDescription>
            </DialogHeader>
            <CalendarioSalaView sala={salaParaCalendario} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

