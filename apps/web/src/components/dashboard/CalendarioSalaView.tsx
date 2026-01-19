"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Building2,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { recursosApi, type ReservaSala, type Sala } from "@/lib/api/recursos";
import { sesionesApi, type Sesion } from "@/lib/api/sesiones";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarioSalaViewProps {
  sala: Sala;
}

interface EventoCalendario {
  id: string;
  tipo: 'SESION' | 'RESERVA';
  titulo: string;
  fechaInicio: Date;
  fechaFin: Date;
  color: string;
  sesion?: Sesion;
  reserva?: ReservaSala;
}

export default function CalendarioSalaView({ sala }: CalendarioSalaViewProps) {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadEventos();
  }, [sala.id, currentDate]);

  const loadEventos = async () => {
    try {
      setIsLoading(true);
      const inicio = startOfMonth(currentDate);
      const fin = endOfMonth(currentDate);
      
      // Cargar reservas de la sala
      const reservas = await recursosApi.getAllReservas(
        sala.id,
        inicio.toISOString(),
        fin.toISOString()
      );

      // Cargar sesiones de la sala
      const sesionesResponse = await sesionesApi.getAll({ page: 1, pageSize: 1000 });
      const sesionesDeSala = sesionesResponse.items.filter(s => s.salaId === sala.id);

      const eventosCalendario: EventoCalendario[] = [];

      // Agregar sesiones directamente
      sesionesDeSala.forEach((sesion) => {
        const fechaSesion = parseISO(sesion.fecha);
        // Para sesiones, usar la fecha de la sesión como inicio y fin si no hay horas
        let horaInicio: Date;
        let horaFin: Date;
        
        if (sesion.horaInicio && sesion.horaFin) {
          horaInicio = parseISO(sesion.horaInicio);
          horaFin = parseISO(sesion.horaFin);
        } else if (sesion.horaInicio) {
          horaInicio = parseISO(sesion.horaInicio);
          // Si solo hay hora inicio, asumir 1 hora de duración
          horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000);
        } else {
          // Si no hay horas, usar todo el día
          horaInicio = startOfDay(fechaSesion);
          horaFin = endOfDay(fechaSesion);
        }
        
        // Verificar si ya existe una reserva para esta sesión
        const tieneReserva = reservas.some(r => r.sesionId === sesion.id);
        
        if (!tieneReserva) {
          eventosCalendario.push({
            id: sesion.id,
            tipo: 'SESION',
            titulo: sesion.taller?.tema || 'Sesión',
            fechaInicio: horaInicio,
            fechaFin: horaFin,
            color: '#2196F3',
            sesion,
          });
        }
      });

      // Agregar reservas
      reservas.forEach((reserva) => {
        const fechaInicio = parseISO(reserva.fechaInicio);
        const fechaFin = parseISO(reserva.fechaFin);
        
        eventosCalendario.push({
          id: reserva.id,
          tipo: reserva.sesionId ? 'SESION' : 'RESERVA',
          titulo: reserva.sesion?.taller?.tema || reserva.motivo || 'Reserva de sala',
          fechaInicio,
          fechaFin,
          color: reserva.sesionId ? '#2196F3' : '#FF9800',
          reserva,
        });
      });
      
      setEventos(eventosCalendario);
      console.log(`✅ Eventos cargados para sala ${sala.nombre}:`, eventosCalendario.length);
      console.log("Eventos:", eventosCalendario);
    } catch (error) {
      console.error("Error cargando eventos de la sala:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventosDelDia = (dia: Date): EventoCalendario[] => {
    const inicioDia = startOfDay(dia);
    const finDia = endOfDay(dia);
    
    return eventos.filter(evento => {
      const inicioEvento = startOfDay(evento.fechaInicio);
      const finEvento = endOfDay(evento.fechaFin);
      
      // Verificar si el día se solapa con el evento
      // El día está dentro del evento si:
      // - El inicio del día está dentro del rango del evento, o
      // - El fin del día está dentro del rango del evento, o
      // - El evento está completamente dentro del día
      return (
        (inicioDia >= inicioEvento && inicioDia <= finEvento) ||
        (finDia >= inicioEvento && finDia <= finEvento) ||
        (inicioDia <= inicioEvento && finDia >= finEvento)
      );
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
          const tieneEventos = eventosDelDia.length > 0;
          
          return (
            <div
              key={dia.toISOString()}
              className={`min-h-24 p-1 border rounded ${
                esDelMes ? "bg-background" : "bg-muted/30"
              } ${esDiaActual ? "ring-2 ring-primary" : ""} ${
                tieneEventos ? "bg-blue-50/50 border-blue-200" : ""
              }`}
            >
              <div className={`text-sm mb-1 font-medium ${
                esDelMes ? "" : "text-muted-foreground"
              } ${tieneEventos ? "text-blue-700" : ""}`}>
                {format(dia, "d")}
              </div>
              <div className="space-y-1">
                {eventosDelDia.slice(0, 3).map((evento) => {
                  // Verificar si el evento tiene horas específicas (no es todo el día)
                  const inicioEsInicioDia = evento.fechaInicio.getHours() === 0 && 
                                           evento.fechaInicio.getMinutes() === 0 && 
                                           evento.fechaInicio.getSeconds() === 0;
                  const finEsFinDia = evento.fechaFin.getHours() === 23 && 
                                     evento.fechaFin.getMinutes() === 59 && 
                                     evento.fechaFin.getSeconds() === 59;
                  const esTodoElDia = inicioEsInicioDia && finEsFinDia && 
                                     isSameDay(evento.fechaInicio, evento.fechaFin);
                  
                  const horaInicio = format(evento.fechaInicio, "HH:mm");
                  const horaFin = format(evento.fechaFin, "HH:mm");
                  
                  return (
                    <div
                      key={evento.id}
                      className="text-xs p-1 rounded cursor-pointer font-medium"
                      style={{ 
                        backgroundColor: evento.color + "30", 
                        color: evento.color,
                        borderLeft: `3px solid ${evento.color}`
                      }}
                      title={`${evento.titulo} - ${format(evento.fechaInicio, "PPp", { locale: es })}`}
                    >
                      <div className="truncate font-semibold">{evento.titulo}</div>
                      {!esTodoElDia && (
                        <div className="text-[10px] opacity-90 mt-0.5 font-medium">
                          🕐 {horaInicio} - {horaFin}
                        </div>
                      )}
                    </div>
                  );
                })}
                {eventosDelDia.length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium">
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Calendario de Uso - {sala.nombre}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {sala.sede} • Capacidad: {sala.capacidad} personas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
        <CardContent>
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h3>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Cargando eventos...</div>
          ) : (
            renderVistaMensual()
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2196F3' }} />
              <span className="text-sm">Sesiones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF9800' }} />
              <span className="text-sm">Reservas/Bloqueos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos del mes */}
      {eventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Eventos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="p-3 border rounded-lg flex items-start gap-3"
                >
                  <div
                    className="w-4 h-4 rounded mt-1"
                    style={{ backgroundColor: evento.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{evento.titulo}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(evento.fechaInicio, "PP", { locale: es })} 
                        {format(evento.fechaInicio, "HH:mm") !== "00:00" && (
                          <> a las {format(evento.fechaInicio, "HH:mm", { locale: es })}</>
                        )}
                        {!isSameDay(evento.fechaInicio, evento.fechaFin) && (
                          <> hasta {format(evento.fechaFin, "PP", { locale: es })}</>
                        )}
                        {format(evento.fechaFin, "HH:mm") !== "23:59" && format(evento.fechaInicio, "HH:mm") !== "00:00" && (
                          <> - {format(evento.fechaFin, "HH:mm", { locale: es })}</>
                        )}
                      </span>
                    </div>
                    {evento.tipo === 'SESION' && evento.reserva?.sesion && (
                      <div className="flex items-center gap-2 mt-1">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Taller: {evento.reserva.sesion.taller?.tema}
                        </span>
                      </div>
                    )}
                    {evento.tipo === 'RESERVA' && evento.reserva?.motivo && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Motivo: {evento.reserva.motivo}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {evento.tipo === 'SESION' ? 'Sesión' : 'Reserva'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
