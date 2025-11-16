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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Users, FileCheck, QrCode } from "lucide-react";
import { asistenciasApi, type Asistencia, type TomarAsistenciaDto, type ItemAsistenciaDto, type AsistenciaResumen } from "@/lib/api/asistencias";
import { sesionesApi, type Sesion } from "@/lib/api/sesiones";
import { participantesApi, type Participante } from "@/lib/api/participantes";
import { inscripcionesApi } from "@/lib/api/inscripciones";
import QRCodeModal from "./QRCodeModal";
import { usePolling } from "@/hooks/usePolling";

export default function AsistenciasView() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [selectedSesionId, setSelectedSesionId] = useState<string>('');
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [resumen, setResumen] = useState<AsistenciaResumen | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [asistenciasForm, setAsistenciasForm] = useState<Record<string, 'PRESENTE' | 'AUSENTE' | 'TARDE'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    loadSesiones();
  }, []);

  useEffect(() => {
    if (selectedSesionId) {
      loadAsistencias();
      loadResumen();
      loadParticipantesParaSesion();
    } else {
      setAsistencias([]);
      setResumen(null);
      setParticipantes([]);
    }
  }, [selectedSesionId]);

  // Inicializar el formulario cuando cambien las asistencias o participantes
  useEffect(() => {
    if (participantes.length > 0) {
      const formData: Record<string, 'PRESENTE' | 'AUSENTE' | 'TARDE'> = {};
      participantes.forEach(p => {
        // Si ya hay una asistencia, usar ese estado
        const asistencia = asistencias.find(a => a.participanteId === p.id);
        formData[p.id] = asistencia?.estado || 'AUSENTE';
      });
      setAsistenciasForm(formData);
    }
  }, [participantes, asistencias]);

  // Polling de sesiones cada 30 segundos
  usePolling(() => {
    loadSesionesSilent();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  // Polling de asistencias y resumen cuando hay una sesión seleccionada
  usePolling(() => {
    if (selectedSesionId) {
      loadAsistencias();
      loadResumen();
    }
  }, { interval: 30000, enabled: !!selectedSesionId, pauseWhenDialogOpen: true });

  const loadSesiones = async () => {
    try {
      setIsLoading(true);
      const response = await sesionesApi.getAll();
      setSesiones(response.items || []);
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSesionesSilent = async () => {
    try {
      const response = await sesionesApi.getAll();
      setSesiones(response.items || []);
    } catch (err) {
      console.error('Error cargando sesiones (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const loadParticipantesParaSesion = async () => {
    if (!selectedSesionId) return;

    try {
      // Obtener la sesión para saber el tallerId
      const sesion = await sesionesApi.getById(selectedSesionId);
      if (!sesion.tallerId) return;

      // Obtener inscripciones del taller
      const inscripciones = await inscripcionesApi.getByTallerId(sesion.tallerId);
      
      // Extraer participantes únicos de las inscripciones
      const participantesIds = new Set<string>();
      inscripciones.forEach(insc => {
        if (insc.participanteId) {
          participantesIds.add(insc.participanteId);
        }
      });

      // Obtener información de los participantes
      const allParticipantes = await participantesApi.getAll();
      const participantesFiltered = allParticipantes.filter((p: Participante) => 
        participantesIds.has(p.id)
      );

      setParticipantes(participantesFiltered);
    } catch (err) {
      console.error('Error cargando participantes:', err);
    }
  };

  const loadAsistencias = async () => {
    if (!selectedSesionId) return;

    try {
      const data = await asistenciasApi.getAll(selectedSesionId);
      setAsistencias(data);
    } catch (err) {
      console.error('Error cargando asistencias:', err);
    }
  };

  const loadResumen = async () => {
    if (!selectedSesionId) return;

    try {
      const data = await asistenciasApi.getResumen(selectedSesionId);
      setResumen(data);
    } catch (err) {
      console.error('Error cargando resumen:', err);
    }
  };

  const handleTomarAsistencia = () => {
    if (!selectedSesionId) {
      setError('Selecciona una sesión primero');
      return;
    }
    setIsDialogOpen(true);
    loadParticipantesParaSesion();
  };

  const handleSubmitAsistencia = async () => {
    if (!selectedSesionId) {
      setError('Selecciona una sesión primero');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const items: ItemAsistenciaDto[] = Object.entries(asistenciasForm).map(([participanteId, estado]) => ({
        participanteId,
        estado,
      }));

      const dto: TomarAsistenciaDto = {
        sesionId: selectedSesionId,
        items,
      };

      await asistenciasApi.tomar(dto);
      setIsDialogOpen(false);
      await loadAsistencias();
      await loadResumen();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al tomar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'PRESENTE':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'TARDE':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'AUSENTE':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PRESENTE':
        return <Badge className="bg-green-100 text-green-800">Presente</Badge>;
      case 'TARDE':
        return <Badge className="bg-yellow-100 text-yellow-800">Tarde</Badge>;
      case 'AUSENTE':
        return <Badge className="bg-red-100 text-red-800">Ausente</Badge>;
      default:
        return <Badge variant="outline">Sin registrar</Badge>;
    }
  };

  const selectedSesion = sesiones.find(s => s.id === selectedSesionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asistencias</h2>
          <p className="text-muted-foreground">Toma y gestiona las asistencias de las sesiones</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsQRModalOpen(true)} 
            disabled={!selectedSesionId}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generar QR
          </Button>
          <Button onClick={handleTomarAsistencia} disabled={!selectedSesionId}>
            <FileCheck className="w-4 h-4 mr-2" />
            Tomar Asistencia
          </Button>
        </div>
      </div>

      {/* Selector de sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="sesion-select">Sesión</Label>
            <Select value={selectedSesionId} onValueChange={setSelectedSesionId}>
              <SelectTrigger id="sesion-select">
                <SelectValue placeholder="Selecciona una sesión" />
              </SelectTrigger>
              <SelectContent>
                {sesiones.map((sesion) => (
                  <SelectItem key={sesion.id} value={sesion.id}>
                    {sesion.taller?.tema || 'Sin taller'} - {new Date(sesion.fecha).toLocaleDateString('es-ES')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {selectedSesionId && (
        <>
          {/* Resumen de asistencia */}
          {resumen && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Presentes</CardTitle>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{resumen.presentes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
                  <XCircle className="w-5 h-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{resumen.ausentes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tardes</CardTitle>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{resumen.tardes}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de asistencias */}
          <Card>
            <CardHeader>
              <CardTitle>Asistencias Registradas</CardTitle>
              <CardDescription>
                {selectedSesion && (
                  <>
                    Sesión: {selectedSesion.taller?.tema || 'Sin taller'} - {new Date(selectedSesion.fecha).toLocaleDateString('es-ES')}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asistencias.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay asistencias registradas para esta sesión
                </div>
              ) : (
                <div className="space-y-2">
                  {asistencias.map((asistencia) => (
                    <div
                      key={asistencia.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getEstadoIcon(asistencia.estado)}
                        <div>
                          <div className="font-medium">
                            {asistencia.participante?.usuario?.nombre || 'Participante desconocido'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {asistencia.participante?.usuario?.email || ''}
                          </div>
                        </div>
                      </div>
                      {getEstadoBadge(asistencia.estado)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog para tomar asistencia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tomar Asistencia</DialogTitle>
            <DialogDescription>
              Marca la asistencia de cada participante para esta sesión
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {participantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay participantes inscritos en este taller
              </div>
            ) : (
              participantes.map((participante) => (
                <div
                  key={participante.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {participante.usuario?.nombre || 'Participante desconocido'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {participante.usuario?.email || ''}
                    </div>
                  </div>
                  <Select
                    value={asistenciasForm[participante.id] || 'AUSENTE'}
                    onValueChange={(value: string) => {
                      if (value === 'PRESENTE' || value === 'AUSENTE' || value === 'TARDE') {
                        setAsistenciasForm({
                          ...asistenciasForm,
                          [participante.id]: value,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENTE">Presente</SelectItem>
                      <SelectItem value="TARDE">Tarde</SelectItem>
                      <SelectItem value="AUSENTE">Ausente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitAsistencia}
              disabled={isSubmitting || participantes.length === 0}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de QR */}
      {selectedSesionId && (
        <QRCodeModal
          sesionId={selectedSesionId}
          sesionTema={selectedSesion?.taller?.tema}
          open={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          onQRGenerated={() => {
            loadAsistencias();
            loadResumen();
          }}
        />
      )}
    </div>
  );
}

