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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  AlertCircle,
  Send,
} from "lucide-react";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AprobacionTalleresView() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaller, setSelectedTaller] = useState<Taller | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAprobarDialogOpen, setIsAprobarDialogOpen] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<'APROBADO' | 'RECHAZADO' | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTalleres();
  }, []);

  const loadTalleres = async () => {
    try {
      setIsLoading(true);
      const data = await talleresApi.getPendientesAprobacion();
      setTalleres(data);
    } catch (error: any) {
      setError(error.message || "Error al cargar talleres pendientes");
      console.error("Error cargando talleres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedTaller || !accionSeleccionada) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await talleresApi.aprobarTaller(
        selectedTaller.id,
        accionSeleccionada,
        comentarios || undefined
      );
      setIsAprobarDialogOpen(false);
      setSelectedTaller(null);
      setAccionSeleccionada(null);
      setComentarios("");
      await loadTalleres();
    } catch (error: any) {
      setError(error.message || "Error al procesar la aprobación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAprobarDialog = (taller: Taller, accion: 'APROBADO' | 'RECHAZADO') => {
    setSelectedTaller(taller);
    setAccionSeleccionada(accion);
    setComentarios("");
    setError(null);
    setIsAprobarDialogOpen(true);
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "BORRADOR":
        return <Badge variant="outline" className="bg-gray-100">Borrador</Badge>;
      case "EN_REVISION":
        return <Badge className="bg-yellow-500">En Revisión</Badge>;
      case "APROBADO":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "RECHAZADO":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado || "Sin estado"}</Badge>;
    }
  };

  const getEstadoTallerBadge = (estado?: string) => {
    switch (estado) {
      case "PUBLICADO":
        return <Badge className="bg-blue-500">Publicado</Badge>;
      case "EN_CURSO":
        return <Badge className="bg-green-500">En Curso</Badge>;
      case "FINALIZADO":
        return <Badge className="bg-gray-500">Finalizado</Badge>;
      case "CERRADO":
        return <Badge className="bg-orange-500">Cerrado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado || "Sin estado"}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Talleres Pendientes de Aprobación</CardTitle>
              <CardDescription>
                Revisa y aprueba o rechaza los talleres propuestos por los trainers
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadTalleres}>
              Actualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">Cargando talleres...</div>
      ) : talleres.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No hay talleres pendientes de aprobación</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {talleres.map((taller) => (
            <Card key={taller.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{taller.tema}</CardTitle>
                      {getEstadoBadge(taller.estadoAprobacion)}
                      {getEstadoTallerBadge(taller.estado)}
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{taller.modalidad}</span>
                      </div>
                      {taller.trainer && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{taller.trainer.nombre} ({taller.trainer.email})</span>
                        </div>
                      )}
                      {taller.sede && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{taller.sede}</span>
                        </div>
                      )}
                      {taller.fechaInicio && taller.fechaFin && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {(() => {
                              try {
                                return `${format(parseISO(taller.fechaInicio!), "PP", { locale: es })} - ${format(parseISO(taller.fechaFin!), "PP", { locale: es })}`;
                              } catch {
                                return `${taller.fechaInicio} - ${taller.fechaFin}`;
                              }
                            })()}
                          </span>
                        </div>
                      )}
                      {taller.cupos !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {taller.cupos} cupos
                            {taller._count && ` • ${taller._count.inscripciones || 0} inscripciones`}
                            {taller._count && ` • ${taller._count.sesiones || 0} sesiones`}
                          </span>
                        </div>
                      )}
                      {taller.unidadEducativa && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>Unidad Educativa: {taller.unidadEducativa.nombre}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTaller(taller);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => openAprobarDialog(taller, 'APROBADO')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openAprobarDialog(taller, 'RECHAZADO')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de detalles del taller */}
      {selectedTaller && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTaller.tema}</DialogTitle>
              <DialogDescription>Detalles completos del taller</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estado de Aprobación</Label>
                  <div className="mt-1">{getEstadoBadge(selectedTaller.estadoAprobacion)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado del Taller</Label>
                  <div className="mt-1">{getEstadoTallerBadge(selectedTaller.estado)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Modalidad</Label>
                  <div>{selectedTaller.modalidad}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sede</Label>
                  <div>{selectedTaller.sede || "No especificada"}</div>
                </div>
              </div>
              {selectedTaller.trainer && (
                <div>
                  <Label className="text-muted-foreground">Trainer</Label>
                  <div>{selectedTaller.trainer.nombre} ({selectedTaller.trainer.email})</div>
                </div>
              )}
              {selectedTaller.fechaInicio && selectedTaller.fechaFin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Fecha de Inicio</Label>
                    <div>
                      {(() => {
                        try {
                          return format(parseISO(selectedTaller.fechaInicio!), "PPpp", { locale: es });
                        } catch {
                          return selectedTaller.fechaInicio;
                        }
                      })()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Fin</Label>
                    <div>
                      {(() => {
                        try {
                          return format(parseISO(selectedTaller.fechaFin!), "PPpp", { locale: es });
                        } catch {
                          return selectedTaller.fechaFin;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
              {selectedTaller.cupos !== undefined && (
                <div>
                  <Label className="text-muted-foreground">Cupos</Label>
                  <div>
                    {selectedTaller.cupos} cupos
                    {selectedTaller.cuposDisponibles !== null && (
                      <span className="text-muted-foreground ml-2">
                        ({selectedTaller.cuposDisponibles} disponibles, {selectedTaller.cuposOcupados || 0} ocupados)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {selectedTaller._count && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Sesiones</Label>
                    <div>{selectedTaller._count.sesiones || 0}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Inscripciones</Label>
                    <div>{selectedTaller._count.inscripciones || 0}</div>
                  </div>
                </div>
              )}
              {selectedTaller.unidadEducativa && (
                <div>
                  <Label className="text-muted-foreground">Unidad Educativa</Label>
                  <div>{selectedTaller.unidadEducativa.nombre}</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cerrar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsDialogOpen(false);
                  openAprobarDialog(selectedTaller, 'APROBADO');
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprobar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsDialogOpen(false);
                  openAprobarDialog(selectedTaller, 'RECHAZADO');
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de aprobar/rechazar */}
      {selectedTaller && (
        <Dialog open={isAprobarDialogOpen} onOpenChange={setIsAprobarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {accionSeleccionada === 'APROBADO' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 inline mr-2 text-green-500" />
                    Aprobar Taller
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 inline mr-2 text-red-500" />
                    Rechazar Taller
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {accionSeleccionada === 'APROBADO'
                  ? `¿Estás seguro de que deseas aprobar el taller "${selectedTaller.tema}"?`
                  : `¿Estás seguro de que deseas rechazar el taller "${selectedTaller.tema}"?`}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="comentarios">
                  Comentarios {accionSeleccionada === 'RECHAZADO' && '(Recomendado)'}
                </Label>
                <Textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder={
                    accionSeleccionada === 'APROBADO'
                      ? "Comentarios adicionales (opcional)"
                      : "Explica el motivo del rechazo..."
                  }
                  rows={4}
                />
                {accionSeleccionada === 'RECHAZADO' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Es recomendable incluir comentarios cuando rechazas un taller para que el trainer pueda hacer las correcciones necesarias.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAprobarDialogOpen(false);
                  setSelectedTaller(null);
                  setAccionSeleccionada(null);
                  setComentarios("");
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant={accionSeleccionada === 'APROBADO' ? 'default' : 'destructive'}
                className={accionSeleccionada === 'APROBADO' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={handleAprobar}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Procesando..."
                  : accionSeleccionada === 'APROBADO'
                  ? "Aprobar"
                  : "Rechazar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
