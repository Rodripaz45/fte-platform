"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users, MapPin, Clock, CheckCircle2, XCircle, MessageSquare, Star, FileCheck, Award } from "lucide-react";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { sesionesApi, type Sesion } from "@/lib/api/sesiones";
import { asistenciasApi, type Asistencia, type AsistenciaResumen } from "@/lib/api/asistencias";
import { inscripcionesApi, type Inscripcion } from "@/lib/api/inscripciones";
import { feedbackApi, type Feedback, type FeedbackResumen } from "@/lib/api/feedback";
import SesionesView from "./SesionesView";
import AsistenciasViewForTaller from "./AsistenciasViewForTaller";
import { usePolling } from "@/hooks/usePolling";

interface TallerDetailViewProps {
  tallerId: string;
  onBack: () => void;
}

export default function TallerDetailView({ tallerId, onBack }: TallerDetailViewProps) {
  const [taller, setTaller] = useState<Taller | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [resumenFeedback, setResumenFeedback] = useState<FeedbackResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTallerData();
  }, [tallerId]);

  // Polling de datos del taller cada 30 segundos
  usePolling(() => {
    loadTallerDataSilent();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadTallerData = async () => {
    try {
      setIsLoading(true);
      const [tallerData, sesionesData, inscripcionesData, feedbacksData, resumenData] = await Promise.all([
        talleresApi.getById(tallerId),
        sesionesApi.getAll({ tallerId }),
        inscripcionesApi.getByTallerId(tallerId),
        feedbackApi.getAll({ tallerId }),
        feedbackApi.getResumen(tallerId).catch(() => null),
      ]);

      setTaller(tallerData);
      setSesiones(sesionesData.items || []);
      setInscripciones(inscripcionesData);
      setFeedbacks(feedbacksData.items || []);
      setResumenFeedback(resumenData);
    } catch (err) {
      console.error('Error cargando datos del taller:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del taller');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTallerDataSilent = async () => {
    try {
      const [tallerData, sesionesData, inscripcionesData, feedbacksData, resumenData] = await Promise.all([
        talleresApi.getById(tallerId),
        sesionesApi.getAll({ tallerId }),
        inscripcionesApi.getByTallerId(tallerId),
        feedbackApi.getAll({ tallerId }),
        feedbackApi.getResumen(tallerId).catch(() => null),
      ]);

      setTaller(tallerData);
      setSesiones(sesionesData.items || []);
      setInscripciones(inscripcionesData);
      setFeedbacks(feedbacksData.items || []);
      setResumenFeedback(resumenData);
    } catch (err) {
      console.error('Error cargando datos del taller (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Formateo especial para fechas de inicio/fin de taller:
  // mostramos siempre 00:00 para inicio y 23:59 para fin, evitando problemas de zona horaria
  const formatTallerDateTime = (dateString?: string, isEnd?: boolean) => {
    if (!dateString) return 'N/A';

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
      month: 'short',
      day: 'numeric',
    });

    const timePart = isEnd ? '23:59' : '00:00';
    return `${datePartFormatted}, ${timePart}`;
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

  const renderStars = (puntaje: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= puntaje
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div>Cargando información del taller...</div>
      </div>
    );
  }

  if (error || !taller) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            {error || 'Taller no encontrado'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de volver */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{taller.tema}</h1>
          <p className="text-muted-foreground mt-1">
            Información completa del taller
          </p>
        </div>
      </div>

      {/* Información del taller */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información del Taller</CardTitle>
            <Badge variant={getEstadoBadgeVariant(taller.estado)}>
              {taller.estado || 'PROGRAMADO'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Modalidad:</span>
                <span>{taller.modalidad}</span>
              </div>
              {taller.sede && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Sede:</span>
                  <span>{taller.sede}</span>
                </div>
              )}
              {taller.cupos && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cupos:</span>
                  <span>{taller.cupos}</span>
                </div>
              )}
            </div>
            {taller.capacidades && (
              <div className="col-span-1 md:col-span-2 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Capacidades y Habilidades a Adquirir
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {taller.capacidades}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {taller.fechaInicio && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Fecha de Inicio:</span>
                  <span>{formatTallerDateTime(taller.fechaInicio)}</span>
                </div>
              )}
              {taller.fechaFin && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Fecha de Fin:</span>
                  <span>{formatTallerDateTime(taller.fechaFin, true)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Inscripciones:</span>
                <span>{inscripciones.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con información detallada */}
      <Tabs defaultValue="sesiones" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="sesiones" className="gap-2">
            <Calendar className="w-4 h-4" />
            Sesiones ({sesiones.length})
          </TabsTrigger>
          <TabsTrigger value="asistencias" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Asistencias
          </TabsTrigger>
          <TabsTrigger value="participantes" className="gap-2">
            <Users className="w-4 h-4" />
            Participantes ({inscripciones.length})
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback ({feedbacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sesiones" className="space-y-4">
          <SesionesView defaultTallerId={tallerId} />
        </TabsContent>

        <TabsContent value="asistencias" className="space-y-4">
          <AsistenciasViewForTaller tallerId={tallerId} sesiones={sesiones} inscripciones={inscripciones} />
        </TabsContent>

        <TabsContent value="participantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes Inscritos</CardTitle>
              <CardDescription>
                Lista de participantes inscritos en este taller
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inscripciones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay participantes inscritos
                </div>
              ) : (
                <div className="space-y-2">
                  {inscripciones.map((inscripcion) => (
                    <div
                      key={inscripcion.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {inscripcion.participante?.usuario?.nombre || 'Participante desconocido'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {inscripcion.participante?.usuario?.email || ''}
                        </div>
                      </div>
                      <Badge variant={inscripcion.estado === 'INSCRITO' ? 'default' : 'outline'}>
                        {inscripcion.estado || 'INSCRITO'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Resumen de feedback */}
          {resumenFeedback && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumenFeedback.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                  <Star className="w-5 h-5 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumenFeedback.promedio.toFixed(1)}</div>
                  {renderStars(Math.round(resumenFeedback.promedio))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Distribución</CardTitle>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const starKey = String(star) as "1" | "2" | "3" | "4" | "5";
                      return (
                        <div key={star} className="flex items-center justify-between">
                          <span>{star} ⭐</span>
                          <span className="font-medium">{resumenFeedback.distribucion[starKey] || 0}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de feedbacks */}
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay feedbacks registrados para este taller
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {feedback.participante?.usuario?.nombre || 'Participante desconocido'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {feedback.participante?.usuario?.email || ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.puntaje)}
                          <Badge variant="outline">{feedback.puntaje}/5</Badge>
                        </div>
                      </div>
                      {feedback.comentario && (
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {feedback.comentario}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {feedback.creadoEn &&
                          new Date(feedback.creadoEn).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

