"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, GraduationCap, BookOpen, Award } from "lucide-react";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { inscripcionesApi, type Inscripcion } from "@/lib/api/inscripciones";
import { useAuth } from "@/contexts/AuthContext";

export default function TalleresDisponiblesView() {
  const { user } = useAuth();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inscribiendoId, setInscribiendoId] = useState<string | null>(null);

  const participanteId = user?.participanteId;

  useEffect(() => {
    loadTalleres();
    loadInscripciones();
  }, []);

  const loadTalleres = async () => {
    try {
      setIsLoading(true);
      const data = await talleresApi.getAll();
      // Solo mostrar talleres PUBLICADOS (solo estos pueden recibir inscripciones)
      const disponibles = data.filter(
        (t) => t.estado === 'PUBLICADO'
      );
      setTalleres(disponibles);
    } catch (err) {
      console.error('Error cargando talleres:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar talleres');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInscripciones = async () => {
    try {
      const data = await inscripcionesApi.getMyInscripciones();
      setInscripciones(data);
    } catch (err) {
      console.error('Error cargando inscripciones:', err);
    }
  };

  const handleInscribirse = async (tallerId: string) => {
    if (!participanteId) {
      setError('No se encontró el ID del participante');
      return;
    }

    setInscribiendoId(tallerId);
    setError(null);

    try {
      await inscripcionesApi.create({
        participanteId,
        tallerId,
      });
      // Recargar tanto inscripciones como talleres para actualizar cupos
      await Promise.all([loadInscripciones(), loadTalleres()]);
      alert('Te has inscrito exitosamente al taller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inscribirse al taller');
    } finally {
      setInscribiendoId(null);
    }
  };

  const isInscrito = (tallerId: string) => {
    return inscripciones.some(
      (insc) => insc.tallerId === tallerId && insc.estado === 'INSCRITO'
    );
  };

  const tieneCuposDisponibles = (taller: Taller) => {
    // Si no tiene cupos limitados, siempre hay disponibilidad
    if (!taller.tieneCuposLimitados) {
      return true;
    }
    // Si tiene cupos limitados, verificar que haya disponibles
    return (taller.cuposDisponibles ?? 0) > 0;
  };

  const getMensajeCupos = (taller: Taller) => {
    if (!taller.tieneCuposLimitados) {
      return null; // Sin límite de cupos
    }
    
    const disponibles = taller.cuposDisponibles ?? 0;
    const ocupados = taller.cuposOcupados ?? 0;
    const total = taller.cupos ?? 0;

    if (disponibles <= 0) {
      return `Cupos agotados (${ocupados}/${total})`;
    }

    return `${disponibles} cupo${disponibles !== 1 ? 's' : ''} disponible${disponibles !== 1 ? 's' : ''} (${ocupados}/${total})`;
  };

  const getEstadoBadgeVariant = (estado?: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'outline';
      case 'PUBLICADO':
        return 'default';
      case 'EN_CURSO':
        return 'default';
      case 'CERRADO':
        return 'secondary';
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

  if (!participanteId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No se encontró información de participante. Por favor, contacta al administrador.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Talleres Disponibles</h2>
        <p className="text-muted-foreground">
          Explora los talleres disponibles e inscríbete en los que te interesen
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando talleres...</div>
      ) : talleres.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay talleres disponibles en este momento
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talleres.map((taller) => {
            const yaInscrito = isInscrito(taller.id);
            return (
              <Card key={taller.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{taller.tema}</CardTitle>
                    <Badge variant={getEstadoBadgeVariant(taller.estado)}>
                      {taller.estado || 'PROGRAMADO'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {taller.modalidad}
                    {taller.sede && ` • ${taller.sede}`}
                  </div>
                </CardHeader>
                <CardContent>
                  {taller.capacidades && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Capacidades a Adquirir
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {taller.capacidades}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 text-sm mb-4">
                    {taller.tieneCuposLimitados && (
                      <div className={`flex items-center gap-2 ${
                        (taller.cuposDisponibles ?? 0) <= 0 
                          ? 'text-destructive font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        <Users className="w-4 h-4" />
                        {getMensajeCupos(taller)}
                      </div>
                    )}
                    {!taller.tieneCuposLimitados && taller.cuposOcupados !== undefined && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {taller.cuposOcupados} inscrito{taller.cuposOcupados !== 1 ? 's' : ''} (sin límite de cupos)
                      </div>
                    )}
                    {taller.fechaInicio && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Inicio: {formatDate(taller.fechaInicio)}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleInscribirse(taller.id)}
                    disabled={
                      yaInscrito || 
                      inscribiendoId === taller.id || 
                      !tieneCuposDisponibles(taller)
                    }
                    className="w-full"
                    variant={yaInscrito ? 'outline' : 'default'}
                  >
                    {inscribiendoId === taller.id ? (
                      'Inscribiendo...'
                    ) : yaInscrito ? (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Ya Inscrito
                      </>
                    ) : !tieneCuposDisponibles(taller) ? (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Cupos Agotados
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Inscribirme
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

