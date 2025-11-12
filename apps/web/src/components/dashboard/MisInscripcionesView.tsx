"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, BookOpen } from "lucide-react";
import { inscripcionesApi, type Inscripcion } from "@/lib/api/inscripciones";
import { useAuth } from "@/contexts/AuthContext";

export default function MisInscripcionesView() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInscripciones();
  }, []);

  const loadInscripciones = async () => {
    try {
      setIsLoading(true);
      const data = await inscripcionesApi.getMyInscripciones();
      setInscripciones(data);
    } catch (err) {
      console.error('Error cargando inscripciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar inscripciones');
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadgeVariant = (estado?: string) => {
    switch (estado) {
      case 'INSCRITO':
        return 'default';
      case 'FINALIZADO':
        return 'secondary';
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'outline';
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


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Inscripciones</h2>
        <p className="text-muted-foreground">
          Talleres en los que estás inscrito
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando inscripciones...</div>
      ) : inscripciones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No estás inscrito en ningún taller todavía
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inscripciones.map((inscripcion) => (
            <Card key={inscripcion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{inscripcion.taller?.tema || 'Taller'}</CardTitle>
                  <Badge variant={getEstadoBadgeVariant(inscripcion.estado)}>
                    {inscripcion.estado || 'INSCRITO'}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {inscripcion.taller?.modalidad || 'N/A'}
                  {inscripcion.taller?.sede && ` • ${inscripcion.taller.sede}`}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {inscripcion.taller?.fechaInicio && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Inicio: {formatDate(inscripcion.taller.fechaInicio)}
                    </div>
                  )}
                  {inscripcion.taller?.fechaFin && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Fin: {formatDate(inscripcion.taller.fechaFin)}
                    </div>
                  )}
                  {inscripcion.taller?.cupos && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {inscripcion.taller.cupos} cupos
                    </div>
                  )}
                  {inscripcion.creadoEn && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <BookOpen className="w-3 h-3" />
                      Inscrito el: {formatDate(inscripcion.creadoEn)}
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

