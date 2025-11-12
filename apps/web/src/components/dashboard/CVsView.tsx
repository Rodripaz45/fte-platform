"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, ExternalLink, Calendar, Upload, X, Sparkles } from "lucide-react";
import { cvsApi, type Cv, type CreateCvDto } from "@/lib/api/cvs";
import { useAuth } from "@/contexts/AuthContext";
import { uploadCV } from "@/lib/firebase/storage";
import { competenciasApi, type Competencia } from "@/lib/api/competencias";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CVsView() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [isLoadingCompetencias, setIsLoadingCompetencias] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  const participanteId = user?.participanteId;

  useEffect(() => {
    if (participanteId) {
      loadCVs();
      loadCompetencias();
    }
  }, [participanteId]);

  // Recargar competencias cuando cambia el participanteId
  // Nota: Las competencias se recargarán automáticamente después de subir un CV

  const loadCVs = async () => {
    if (!participanteId) return;

    try {
      setIsLoading(true);
      const data = await cvsApi.getAll(participanteId);
      setCvs(data);
    } catch (err) {
      console.error('Error cargando CVs:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar CVs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetencias = async () => {
    if (!participanteId) return;

    try {
      setIsLoadingCompetencias(true);
      const data = await competenciasApi.getByParticipanteId(participanteId);
      setCompetencias(data);
      if (data.length > 0 && data[0].actualizadoEn) {
        setLastAnalysisTime(new Date(data[0].actualizadoEn));
      }
    } catch (err) {
      console.error('Error cargando competencias:', err);
      // No mostramos error al usuario si falla la carga de competencias
    } finally {
      setIsLoadingCompetencias(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea un PDF
      if (file.type !== 'application/pdf') {
        setError('El archivo debe ser un PDF');
        return;
      }
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('El archivo no debe exceder 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!participanteId) {
      setError('No se encontró el ID del participante');
      return;
    }

    if (!selectedFile) {
      setError('Por favor, selecciona un archivo PDF');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Subir archivo a Firebase Storage (reemplazará el anterior si existe)
      const downloadURL = await uploadCV(
        selectedFile,
        participanteId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Crear el nuevo CV en el backend con la URL de Firebase Storage
      // El backend se encargará de eliminar el CV anterior si existe
      // El backend ejecutará automáticamente el análisis en segundo plano
      const createData: CreateCvDto = {
        participanteId,
        url: downloadURL,
      };
      await cvsApi.create(createData);
      
      // Recargar lista de CVs
      await loadCVs();
      
      // Limpiar formulario después de recargar
      setSelectedFile(null);
      setUploadProgress(0);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Cerrar diálogo al final
      setIsDialogOpen(false);
      
      // Cargar competencias después de un delay (para permitir que el análisis se complete)
      // El análisis se ejecuta automáticamente en el backend después de crear el CV
      setTimeout(() => {
        loadCompetencias();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el CV');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting && !open) {
      setIsDialogOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (open) {
      setIsDialogOpen(true);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Curriculums</h2>
          <p className="text-muted-foreground">Gestiona tus CVs subidos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          {cvs.length > 0 ? 'Reemplazar CV' : 'Subir CV'}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando CVs...</div>
      ) : cvs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No has subido ningún CV todavía
          </CardContent>
        </Card>
      ) : (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Mi Curriculum
                </CardTitle>
                {cvs[0]?.subidoEn && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(cvs[0].subidoEn)}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cvs[0]?.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(cvs[0].url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver PDF
                </Button>
              )}

              {/* Sección de Competencias */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Competencias Adquiridas</h3>
                </div>
                
                {isLoadingCompetencias ? (
                  <div className="text-sm text-muted-foreground">
                    Analizando perfil... Esto puede tomar unos segundos.
                  </div>
                ) : competencias.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {cvs.length > 0 
                      ? 'Las competencias se generarán automáticamente después del análisis. Esto puede tomar unos segundos.'
                      : 'Sube un CV para comenzar el análisis de competencias.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lastAnalysisTime && (
                      <div className="text-xs text-muted-foreground">
                        Última actualización: {formatDate(lastAnalysisTime.toISOString())}
                      </div>
                    )}
                    <div className="grid gap-3">
                      {competencias.map((comp, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{comp.competencia}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Nivel: {comp.nivel}/100
                              </Badge>
                              {comp.confianza && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(comp.confianza * 100)}% confianza
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Progress value={comp.nivel} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para subir CV */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => handleDialogClose(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{cvs.length > 0 ? 'Reemplazar CV' : 'Subir CV'}</DialogTitle>
            <DialogDescription>
              {cvs.length > 0 
                ? 'Selecciona un nuevo archivo PDF de tu curriculum. Reemplazará el CV actual.'
                : 'Selecciona un archivo PDF de tu curriculum. El sistema lo subirá a la nube.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Archivo PDF *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Máximo 10MB. Solo archivos PDF.
                </p>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subiendo archivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
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
                onClick={() => handleDialogClose(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir CV
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

