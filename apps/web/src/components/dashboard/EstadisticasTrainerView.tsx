"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  BookOpen,
  BarChart3,
  PieChart,
} from "lucide-react";
import { talleresApi, type EstadisticasTrainer } from "@/lib/api/talleres";

export default function EstadisticasTrainerView() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasTrainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await talleresApi.getEstadisticasTrainer();
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar estadísticas");
      console.error("Error cargando estadísticas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          <p>{error}</p>
          <button
            onClick={loadEstadisticas}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!estadisticas) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No hay estadísticas disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Mis Estadísticas
          </CardTitle>
          <CardDescription>
            Resumen de tu desempeño como trainer
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Talleres</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalTalleres}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.talleresPublicados} publicados, {estadisticas.talleresEnCurso} en curso,{" "}
              {estadisticas.talleresFinalizados} finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.tasaAsistenciaPromedio.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.totalAsistencias} asistencias de {estadisticas.totalSesiones} sesiones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.satisfaccionPromedio > 0
                ? estadisticas.satisfaccionPromedio.toFixed(1)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.totalRetroalimentaciones} retroalimentaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.participantesCertificados}</div>
            <p className="text-xs text-muted-foreground">
              De {estadisticas.participantesUnicos} participantes únicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Actividad General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Sesiones</span>
              <span className="font-semibold">{estadisticas.totalSesiones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Inscripciones</span>
              <span className="font-semibold">{estadisticas.totalInscripciones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Asistencias</span>
              <span className="font-semibold">{estadisticas.totalAsistencias}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Participantes Únicos</span>
              <span className="font-semibold">{estadisticas.participantesUnicos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retroalimentaciones</span>
              <span className="font-semibold">{estadisticas.totalRetroalimentaciones}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Talleres por Modalidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estadisticas.talleresPorModalidad.length > 0 ? (
              <div className="space-y-2">
                {estadisticas.talleresPorModalidad.map((item) => (
                  <div key={item.modalidad} className="flex items-center justify-between">
                    <Badge variant="outline">{item.modalidad}</Badge>
                    <span className="font-semibold">{item.cantidad}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay talleres registrados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Talleres por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Talleres por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estadisticas.talleresPorEstado.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-3">
              {estadisticas.talleresPorEstado.map((item) => (
                <div
                  key={item.estado}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <Badge
                    variant={
                      item.estado === "PUBLICADO" || item.estado === "EN_CURSO"
                        ? "default"
                        : item.estado === "FINALIZADO"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {item.estado}
                  </Badge>
                  <span className="font-semibold ml-2">{item.cantidad}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay talleres registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
