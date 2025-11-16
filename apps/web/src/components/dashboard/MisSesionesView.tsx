"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { sesionesApi, type Sesion } from "@/lib/api/sesiones";

export default function MisSesionesView() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSesiones();
  }, []);

  const loadSesiones = async () => {
    try {
      setIsLoading(true);
      const data = await sesionesApi.getMySesiones();
      setSesiones(data);
    } catch (err) {
      console.error("Error cargando sesiones del participante:", err);
      setError(err instanceof Error ? err.message : "Error al cargar sesiones");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Sesiones</h2>
        <p className="text-muted-foreground">
          Sesiones de los talleres en los que estás inscrito, para saber a cuáles debes asistir.
        </p>
      </div>

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
            No tienes sesiones asignadas por ahora.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sesiones.map((sesion) => (
            <Card key={sesion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {sesion.taller?.tema || "Taller"}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {sesion.taller?.modalidad || "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(sesion.fecha)}</span>
                  </div>
                  {(sesion.horaInicio || sesion.horaFin) && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {sesion.horaInicio ? formatTime(sesion.horaInicio) : "--:--"}
                        {sesion.horaFin ? ` - ${formatTime(sesion.horaFin)}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


