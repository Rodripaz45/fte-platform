"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  AlertTriangle,
  CheckCircle2,
  Building2,
  GraduationCap,
  Clock,
  MapPin,
  Users,
  X
} from "lucide-react";
import { calendarioApi, type EventoCalendario, type FiltrosCalendario, type ConflictoCalendario } from "@/lib/api/calendario";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

export default function CalendarioView() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [conflictos, setConflictos] = useState<ConflictoCalendario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showConflictos, setShowConflictos] = useState(false);
  
  // Determinar si es trainer
  const isTrainer = user?.roles?.includes("TRAINER");
  
  // Filtros - Solo sesiones por defecto, y si es trainer, filtrar por su ID
  const [filtros, setFiltros] = useState<FiltrosCalendario>({
    tiposEvento: ['SESION'],
  });

  useEffect(() => {
    // Actualizar filtros si el usuario es trainer
    if (isTrainer && user?.id) {
      setFiltros(prev => ({
        ...prev,
        trainerId: user.id,
        tiposEvento: ['SESION'], // Asegurar que solo muestre sesiones
      }));
    } else {
      // Si no es trainer, remover el filtro de trainerId
      setFiltros(prev => {
        const { trainerId, ...rest } = prev;
        return rest;
      });
    }
  }, [isTrainer, user?.id]);

  useEffect(() => {
    loadEventos();
    loadConflictos();
  }, [currentDate, filtros]);

  const loadEventos = async () => {
    try {
      setIsLoading(true);
      const inicio = startOfMonth(currentDate);
      const fin = endOfMonth(currentDate);
      
      const response = await calendarioApi.obtenerEventos({
        ...filtros,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
      });
      
      setEventos(response.eventos);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConflictos = async () => {
    try {
      const inicio = startOfMonth(currentDate);
      const fin = endOfMonth(currentDate);
      
      const response = await calendarioApi.detectarConflictos(
        inicio.toISOString(),
        fin.toISOString()
      );
      
      setConflictos(response.conflictos);
    } catch (error) {
      console.error("Error cargando conflictos:", error);
    }
  };

  const getEventosDelDia = (fecha: Date): EventoCalendario[] => {
    return eventos.filter(evento => {
      try {
        const eventoFecha = parseISO(evento.fechaInicio);
        return isSameDay(eventoFecha, fecha);
      } catch {
        return false;
      }
    });
  };

  const getEventosDeLaSemana = (): EventoCalendario[] => {
    const inicioSemana = startOfWeek(currentDate, { weekStartsOn: 1 });
    const finSemana = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    return eventos.filter(evento => {
      try {
        const eventoFecha = parseISO(evento.fechaInicio);
        return eventoFecha >= inicioSemana && eventoFecha <= finSemana;
      } catch {
        return false;
      }
    });
  };

  const renderVistaMensual = () => {
    const inicioMes = startOfMonth(currentDate);
    const finMes = endOfMonth(currentDate);
    const inicioSemana = startOfWeek(inicioMes, { weekStartsOn: 1 });
    const finSemana = endOfWeek(finMes, { weekStartsOn: 1 });
    const dias = eachDayOfInterval({ start: inicioSemana, end: finSemana });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Días de la semana */}
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
          <div key={dia} className="p-2 text-center text-sm font-semibold text-muted-foreground">
            {dia}
          </div>
        ))}
        
        {/* Días del mes */}
        {dias.map((dia) => {
          const eventosDelDia = getEventosDelDia(dia);
          const esDiaActual = isSameDay(dia, new Date());
          const esDelMes = isSameMonth(dia, currentDate);
          
          return (
            <div
              key={dia.toISOString()}
              className={`min-h-24 p-1 border rounded ${
                esDelMes ? "bg-background" : "bg-muted/30"
              } ${esDiaActual ? "ring-2 ring-primary" : ""}`}
            >
              <div className={`text-sm mb-1 ${esDelMes ? "" : "text-muted-foreground"}`}>
                {format(dia, "d")}
              </div>
              <div className="space-y-1">
                {eventosDelDia.slice(0, 3).map((evento) => {
                  let horaInicio = "";
                  let horaFin = "";
                  let tieneHorario = false;
                  
                  if (!evento.todoElDia && evento.fechaInicio) {
                    try {
                      const inicio = parseISO(evento.fechaInicio);
                      const fin = parseISO(evento.fechaFin);
                      horaInicio = format(inicio, "HH:mm");
                      horaFin = format(fin, "HH:mm");
                      tieneHorario = true;
                    } catch {
                      tieneHorario = false;
                    }
                  }
                  
                  return (
                    <div
                      key={evento.id}
                      onClick={() => setSelectedEvent(evento)}
                      className="text-xs p-1 rounded cursor-pointer font-medium"
                      style={{ backgroundColor: evento.color + "30", color: evento.color, borderLeft: `3px solid ${evento.color}` }}
                      title={evento.titulo}
                    >
                      <div className="truncate font-semibold">{evento.titulo}</div>
                      {tieneHorario && (
                        <div className="text-[10px] opacity-90 mt-0.5 font-medium">
                          🕐 {horaInicio} - {horaFin}
                        </div>
                      )}
                    </div>
                  );
                })}
                {eventosDelDia.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{eventosDelDia.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVistaSemanal = () => {
    const inicioSemana = startOfWeek(currentDate, { weekStartsOn: 1 });
    const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
    const eventosSemana = getEventosDeLaSemana();

    return (
      <div className="grid grid-cols-7 gap-2">
        {diasSemana.map((dia) => {
          const eventosDelDia = getEventosDelDia(dia);
          const esDiaActual = isSameDay(dia, new Date());
          
          return (
            <div key={dia.toISOString()} className="border rounded p-2">
              <div className={`text-sm font-semibold mb-2 ${esDiaActual ? "text-primary" : ""}`}>
                {format(dia, "EEE d", { locale: es })}
              </div>
              <div className="space-y-1">
                {eventosDelDia.map((evento) => {
                  let horaInicio = "";
                  let horaFin = "";
                  let tieneHorario = false;
                  
                  if (!evento.todoElDia && evento.fechaInicio) {
                    try {
                      const inicio = parseISO(evento.fechaInicio);
                      const fin = parseISO(evento.fechaFin);
                      horaInicio = format(inicio, "HH:mm");
                      horaFin = format(fin, "HH:mm");
                      tieneHorario = true;
                    } catch {
                      tieneHorario = false;
                    }
                  }
                  
                  return (
                    <div
                      key={evento.id}
                      onClick={() => setSelectedEvent(evento)}
                      className="text-xs p-2 rounded cursor-pointer border-l-4"
                      style={{ borderLeftColor: evento.color }}
                    >
                      <div className="font-medium truncate">{evento.titulo}</div>
                      {tieneHorario && (
                        <div className="text-muted-foreground font-medium mt-0.5">
                          🕐 {horaInicio} - {horaFin}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVistaDiaria = () => {
    const eventosDelDia = getEventosDelDia(currentDate);
    
    return (
      <div className="space-y-2">
        <div className="text-lg font-semibold mb-4">
          {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </div>
        {eventosDelDia.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay eventos para este día
          </div>
        ) : (
          eventosDelDia.map((evento) => (
            <Card
              key={evento.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedEvent(evento)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded mt-1"
                    style={{ backgroundColor: evento.color }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{evento.titulo}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {evento.descripcion}
                    </div>
                    {!evento.todoElDia && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {(() => {
                          try {
                            const inicio = parseISO(evento.fechaInicio);
                            const fin = parseISO(evento.fechaFin);
                            return `${format(inicio, "HH:mm")} - ${format(fin, "HH:mm")}`;
                          } catch {
                            return "";
                          }
                        })()}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">{evento.tipo}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const getIconoTipo = (tipo: string) => {
    // Solo mostramos sesiones, así que siempre retornamos el icono de sesión
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendario de Sesiones</CardTitle>
              <CardDescription>
                {format(currentDate, "MMMM yyyy", { locale: es })} - Visualización de sesiones programadas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {conflictos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConflictos(true)}
                  className="text-orange-600"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {conflictos.length} conflicto{conflictos.length > 1 ? 's' : ''}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Mes
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Día
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panel de filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Sede</Label>
                <Input
                  placeholder="Filtrar por sede"
                  value={filtros.sede || ''}
                  onChange={(e) => setFiltros({ ...filtros, sede: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>Modalidad</Label>
                <Input
                  placeholder="Filtrar por modalidad"
                  value={filtros.modalidad || ''}
                  onChange={(e) => setFiltros({ ...filtros, modalidad: e.target.value || undefined })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista del calendario */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">Cargando eventos...</div>
          ) : (
            <>
              {viewMode === "month" && renderVistaMensual()}
              {viewMode === "week" && renderVistaSemanal()}
              {viewMode === "day" && renderVistaDiaria()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles del evento */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {getIconoTipo(selectedEvent.tipo)}
                <DialogTitle>{selectedEvent.titulo}</DialogTitle>
                <Badge style={{ backgroundColor: selectedEvent.color + "20", color: selectedEvent.color }}>
                  {selectedEvent.tipo}
                </Badge>
              </div>
              <DialogDescription>{selectedEvent.descripcion}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedEvent.taller && (
                <div>
                  <Label className="text-muted-foreground">Taller</Label>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedEvent.taller.tema}</span>
                    <Badge variant="outline" className="ml-2">{selectedEvent.taller.modalidad}</Badge>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <div>
                    {(() => {
                      try {
                        return format(parseISO(selectedEvent.fechaInicio), "PP", { locale: es });
                      } catch {
                        return selectedEvent.fechaInicio;
                      }
                    })()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Horario</Label>
                  <div>
                    {(() => {
                      try {
                        const inicio = parseISO(selectedEvent.fechaInicio);
                        const fin = parseISO(selectedEvent.fechaFin);
                        return `${format(inicio, "HH:mm")} - ${format(fin, "HH:mm")}`;
                      } catch {
                        return "Todo el día";
                      }
                    })()}
                  </div>
                </div>
              </div>
              
              {selectedEvent.responsable && (
                <div>
                  <Label className="text-muted-foreground">Responsable</Label>
                  <div>{selectedEvent.responsable.nombre}</div>
                </div>
              )}
              
              {selectedEvent.trainer && (
                <div>
                  <Label className="text-muted-foreground">Trainer</Label>
                  <div>{selectedEvent.trainer.nombre}</div>
                </div>
              )}
              
              {selectedEvent.sala && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.sala.nombre} - {selectedEvent.sala.sede}</span>
                </div>
              )}
              
              {selectedEvent.sede && !selectedEvent.sala && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.sede}</span>
                </div>
              )}
              
              {selectedEvent.cupos !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.inscripciones || 0} / {selectedEvent.cupos || '∞'} participantes</span>
                </div>
              )}
              
              {selectedEvent.estado && (
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge variant="outline">{selectedEvent.estado}</Badge>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de conflictos */}
      {showConflictos && (
        <Dialog open={showConflictos} onOpenChange={setShowConflictos}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Conflictos Detectados
              </DialogTitle>
              <DialogDescription>
                Se encontraron {conflictos.length} conflicto{conflictos.length > 1 ? 's' : ''} en el calendario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {conflictos.map((conflicto, index) => (
                <Card key={index} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-orange-600 mb-1">
                          {conflicto.descripcion}
                        </div>
                        {conflicto.trainer && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Trainer: {conflicto.trainer.nombre}
                          </div>
                        )}
                        {conflicto.sala && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Sala: {conflicto.sala.nombre} - {conflicto.sala.sede}
                          </div>
                        )}
                        {conflicto.sesiones && conflicto.sesiones.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-sm font-medium">Sesiones en conflicto:</div>
                            {conflicto.sesiones.map((sesion, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground pl-4">
                                • {sesion.taller} - {(() => {
                                  try {
                                    return format(parseISO(sesion.fecha), "PP", { locale: es });
                                  } catch {
                                    return sesion.fecha;
                                  }
                                })()}
                                {sesion.horaInicio && ` ${(() => {
                                  try {
                                    return format(parseISO(sesion.horaInicio!), "HH:mm");
                                  } catch {
                                    return sesion.horaInicio;
                                  }
                                })()}`}
                              </div>
                            ))}
                          </div>
                        )}
                        {conflicto.reservas && conflicto.reservas.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-sm font-medium">Reservas en conflicto:</div>
                            {conflicto.reservas.map((reserva, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground pl-4">
                                • {(() => {
                                  try {
                                    return `${format(parseISO(reserva.fechaInicio), "PP", { locale: es })} - ${format(parseISO(reserva.fechaFin), "PP", { locale: es })}`;
                                  } catch {
                                    return `${reserva.fechaInicio} - ${reserva.fechaFin}`;
                                  }
                                })()}
                                {reserva.sesion && ` - ${reserva.sesion.taller}`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

