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
import { CheckCircle2, XCircle, Clock, Users, FileCheck, Calendar, QrCode, Upload, Image, X, Eye, Trash2 } from "lucide-react";
import { asistenciasApi, type Asistencia, type TomarAsistenciaDto, type ItemAsistenciaDto, type AsistenciaResumen, type AsistenciaUE, type TomarAsistenciaUEDto, type ItemAsistenciaUEDto, type AsistenciaUEResumen, type EvidenciaAsistencia } from "@/lib/api/asistencias";
import { uploadEvidenciaAsistencia } from "@/lib/firebase/storage";
import { Input } from "@/components/ui/input";
import { type Sesion } from "@/lib/api/sesiones";
import { type Inscripcion } from "@/lib/api/inscripciones";
import { participantesApi, type Participante } from "@/lib/api/participantes";
import { importacionesApi, type ListaParticipanteUE } from "@/lib/api/importaciones";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import QRCodeModal from "./QRCodeModal";
import { usePolling } from "@/hooks/usePolling";

interface AsistenciasViewForTallerProps {
  tallerId: string;
  sesiones: Sesion[];
  inscripciones: Inscripcion[];
}

export default function AsistenciasViewForTaller({ tallerId, sesiones, inscripciones }: AsistenciasViewForTallerProps) {
  const [selectedSesionId, setSelectedSesionId] = useState<string>('');
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [participantesUE, setParticipantesUE] = useState<ListaParticipanteUE[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [asistenciasUE, setAsistenciasUE] = useState<AsistenciaUE[]>([]);
  const [resumen, setResumen] = useState<AsistenciaResumen | null>(null);
  const [resumenUE, setResumenUE] = useState<AsistenciaUEResumen | null>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [asistenciasForm, setAsistenciasForm] = useState<Record<string, 'PRESENTE' | 'AUSENTE' | 'TARDE'>>({});
  const [asistenciasUEForm, setAsistenciasUEForm] = useState<Record<string, 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [evidenciaSesionId, setEvidenciaSesionId] = useState<string | null>(null);
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);
  const [isUploadingEvidencia, setIsUploadingEvidencia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [evidenciaPreview, setEvidenciaPreview] = useState<string | null>(null);
  const [evidenciasDialogOpen, setEvidenciasDialogOpen] = useState(false);
  const [evidenciasAsistencia, setEvidenciasAsistencia] = useState<EvidenciaAsistencia[]>([]);

  const isTallerUE = taller?.tipo === 'UNIDAD_EDUCATIVA';

  useEffect(() => {
    loadTaller();
  }, [tallerId]);

  useEffect(() => {
    if (selectedSesionId) {
      if (isTallerUE) {
        loadAsistenciasUE();
        loadResumenUE();
        loadParticipantesUE();
      } else {
        loadAsistencias();
        loadResumen();
        loadParticipantesParaSesion();
      }
    } else {
      setAsistencias([]);
      setAsistenciasUE([]);
      setResumen(null);
      setResumenUE(null);
      setParticipantes([]);
      setParticipantesUE([]);
    }
  }, [selectedSesionId, isTallerUE]);

  // Inicializar el formulario cuando cambien las asistencias o participantes
  useEffect(() => {
    if (isTallerUE) {
      if (participantesUE.length > 0) {
        const formData: Record<string, 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'> = {};
        participantesUE.forEach(p => {
          // Si ya hay una asistencia, usar ese estado
          const asistencia = asistenciasUE.find(a => a.listaParticipanteUEId === p.id);
          formData[p.id] = (asistencia?.estado as 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO') || 'AUSENTE';
        });
        setAsistenciasUEForm(formData);
      }
    } else {
      if (participantes.length > 0) {
        const formData: Record<string, 'PRESENTE' | 'AUSENTE' | 'TARDE'> = {};
        participantes.forEach(p => {
          // Si ya hay una asistencia, usar ese estado
          const asistencia = asistencias.find(a => a.participanteId === p.id);
          formData[p.id] = asistencia?.estado || 'AUSENTE';
        });
        setAsistenciasForm(formData);
      }
    }
  }, [participantes, participantesUE, asistencias, asistenciasUE, isTallerUE]);

  // Polling de asistencias y resumen cuando hay una sesión seleccionada
  usePolling(() => {
    if (selectedSesionId) {
      if (isTallerUE) {
        loadAsistenciasUE();
        loadResumenUE();
      } else {
        loadAsistencias();
        loadResumen();
      }
    }
  }, { interval: 30000, enabled: !!selectedSesionId, pauseWhenDialogOpen: true });

  const loadTaller = async () => {
    try {
      const data = await talleresApi.getById(tallerId);
      setTaller(data);
    } catch (err) {
      console.error('Error cargando taller:', err);
    }
  };

  const loadParticipantesUE = async () => {
    if (!selectedSesionId || !tallerId) return;

    try {
      const lista = await importacionesApi.obtenerLista(tallerId);
      setParticipantesUE(lista);
    } catch (err) {
      console.error('Error cargando participantes UE:', err);
    }
  };

  const loadAsistenciasUE = async () => {
    if (!selectedSesionId) return;

    try {
      const data = await asistenciasApi.getAsistenciasUE(selectedSesionId);
      setAsistenciasUE(data);
    } catch (err) {
      console.error('Error cargando asistencias UE:', err);
    }
  };

  const loadResumenUE = async () => {
    if (!selectedSesionId) return;

    try {
      const data = await asistenciasApi.getResumenUE(selectedSesionId);
      setResumenUE(data);
    } catch (err) {
      console.error('Error cargando resumen UE:', err);
    }
  };

  const loadParticipantesParaSesion = async () => {
    if (!selectedSesionId) return;

    try {
      // Obtener participantes únicos de las inscripciones del taller
      const participantesIds = new Set<string>();
      inscripciones.forEach(insc => {
        if (insc.participanteId) {
          participantesIds.add(insc.participanteId);
        }
      });

      // Obtener información de los participantes
      const allParticipantes = await participantesApi.getAll();
      const participantesFiltered = allParticipantes.filter(p => 
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
    if (isTallerUE) {
      loadParticipantesUE();
    } else {
      loadParticipantesParaSesion();
    }
  };

  const handleSubmitAsistencia = async () => {
    if (!selectedSesionId) {
      setError('Selecciona una sesión primero');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isTallerUE) {
        const items: ItemAsistenciaUEDto[] = Object.entries(asistenciasUEForm).map(([listaParticipanteUEId, estado]) => ({
          listaParticipanteUEId,
          estado,
        }));

        const dto: TomarAsistenciaUEDto = {
          sesionId: selectedSesionId,
          items,
        };

        await asistenciasApi.tomarUE(dto);
        setIsDialogOpen(false);
        await loadAsistenciasUE();
        await loadResumenUE();
      } else {
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al tomar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbrirEvidencias = async () => {
    if (!selectedSesionId) {
      setError('Selecciona una sesión primero');
      return;
    }
    setEvidenciaSesionId(selectedSesionId);
    setEvidenciasDialogOpen(true);
    try {
      const evidencias = await asistenciasApi.obtenerEvidencias(selectedSesionId);
      setEvidenciasAsistencia(evidencias);
    } catch (err) {
      console.error('Error cargando evidencias:', err);
      setEvidenciasAsistencia([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.match(/^image\//)) {
      setError('El archivo debe ser una imagen (JPG, PNG, etc.)');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe exceder 5MB');
      return;
    }

    setEvidenciaFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setEvidenciaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubirEvidencia = async () => {
    if (!evidenciaSesionId || !evidenciaFile) {
      setError('Selecciona un archivo de imagen');
      return;
    }

    setIsUploadingEvidencia(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Subir a Firebase Storage
      const url = await uploadEvidenciaAsistencia(
        evidenciaFile,
        evidenciaSesionId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Guardar en el backend
      await asistenciasApi.crearEvidencia({
        sesionId: evidenciaSesionId,
        tipo: 'FOTO',
        url,
      });

      // Recargar evidencias
      const evidencias = await asistenciasApi.obtenerEvidencias(evidenciaSesionId);
      setEvidenciasAsistencia(evidencias);

      // Limpiar formulario
      setEvidenciaFile(null);
      setEvidenciaPreview(null);
      setUploadProgress(0);
      if (document.getElementById('evidencia-input')) {
        (document.getElementById('evidencia-input') as HTMLInputElement).value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir evidencia');
    } finally {
      setIsUploadingEvidencia(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return;

    try {
      await asistenciasApi.eliminarEvidencia(evidenciaId);
      // Recargar evidencias
      if (evidenciaSesionId) {
        const evidencias = await asistenciasApi.obtenerEvidencias(evidenciaSesionId);
        setEvidenciasAsistencia(evidencias);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar evidencia');
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
                    {formatDate(sesion.fecha)} - {sesion.horaInicio && new Date(sesion.horaInicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
          {(resumen || resumenUE) && (
            <div className={`grid gap-4 ${isTallerUE ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isTallerUE ? resumenUE?.total || 0 : resumen?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Presentes</CardTitle>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{isTallerUE ? resumenUE?.presentes || 0 : resumen?.presentes || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
                  <XCircle className="w-5 h-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{isTallerUE ? resumenUE?.ausentes || 0 : resumen?.ausentes || 0}</div>
                </CardContent>
              </Card>
              {isTallerUE ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Justificados</CardTitle>
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{resumenUE?.justificados || 0}</div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tardes</CardTitle>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{resumen?.tardes || 0}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Lista de asistencias */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asistencias Registradas</CardTitle>
                  <CardDescription>
                    {selectedSesion && (
                      <>
                        Sesión: {formatDate(selectedSesion.fecha)} - {selectedSesion.horaInicio && new Date(selectedSesion.horaInicio).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    )}
                  </CardDescription>
                </div>
                {selectedSesionId && (
                  <Button
                    variant="outline"
                    onClick={handleAbrirEvidencias}
                    className="flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Evidencias de Sesión
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isTallerUE ? (
                asistenciasUE.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay asistencias registradas para esta sesión
                  </div>
                ) : (
                  <div className="space-y-2">
                    {asistenciasUE.map((asistencia) => (
                      <div
                        key={asistencia.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getEstadoIcon(asistencia.estado || 'AUSENTE')}
                          <div>
                            <div className="font-medium">
                              {asistencia.listaParticipante?.nombre || 'Participante desconocido'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {asistencia.listaParticipante?.documento && `Doc: ${asistencia.listaParticipante.documento}`}
                              {asistencia.listaParticipante?.email && ` - ${asistencia.listaParticipante.email}`}
                            </div>
                          </div>
                        </div>
                        {getEstadoBadge(asistencia.estado || 'AUSENTE')}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                asistencias.length === 0 ? (
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
                )
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog para evidencias */}
      <Dialog open={evidenciasDialogOpen} onOpenChange={setEvidenciasDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evidencias de Sesión</DialogTitle>
            <DialogDescription>
              Sube una captura de pantalla (JPG, PNG, etc.) de la sesión virtual completa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {/* Formulario para subir nueva evidencia */}
            <div className="border rounded-lg p-4 space-y-4">
              <Label htmlFor="evidencia-input">Seleccionar imagen (JPG, PNG, etc. - máx. 5MB)</Label>
              <Input
                id="evidencia-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploadingEvidencia}
              />
              {evidenciaPreview && (
                <div className="relative">
                  <img
                    src={evidenciaPreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subiendo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button
                onClick={handleSubirEvidencia}
                disabled={!evidenciaFile || isUploadingEvidencia}
                className="w-full"
              >
                {isUploadingEvidencia ? 'Subiendo...' : 'Subir Evidencia'}
              </Button>
            </div>

            {/* Lista de evidencias existentes */}
            <div className="space-y-2">
              <Label>Evidencias existentes</Label>
              {evidenciasAsistencia.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay evidencias subidas aún
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {evidenciasAsistencia.map((evidencia) => (
                    <div key={evidencia.id} className="border rounded-lg p-2 relative group">
                      <img
                        src={evidencia.url}
                        alt="Evidencia"
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(evidencia.url, '_blank')}
                          className="bg-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEliminarEvidencia(evidencia.id)}
                          className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(evidencia.creadoEn).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvidenciasDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {isTallerUE ? (
              participantesUE.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay participantes importados en este taller
                </div>
              ) : (
                participantesUE.map((participante) => (
                  <div
                    key={participante.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {participante.nombre || 'Participante desconocido'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participante.documento && `Doc: ${participante.documento}`}
                        {participante.email && ` - ${participante.email}`}
                      </div>
                    </div>
                    <Select
                      value={asistenciasUEForm[participante.id] || 'AUSENTE'}
                      onValueChange={(value: string) => {
                        if (value === 'PRESENTE' || value === 'AUSENTE' || value === 'JUSTIFICADO') {
                          setAsistenciasUEForm({
                            ...asistenciasUEForm,
                            [participante.id]: value as 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO',
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENTE">Presente</SelectItem>
                        <SelectItem value="AUSENTE">Ausente</SelectItem>
                        <SelectItem value="JUSTIFICADO">Justificado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )
            ) : (
              participantes.length === 0 ? (
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
              )
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
              disabled={isSubmitting || (isTallerUE ? participantesUE.length === 0 : participantes.length === 0)}
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

