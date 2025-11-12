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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { feedbackApi, type Feedback, type CreateFeedbackDto } from "@/lib/api/feedback";
import { inscripcionesApi, type Inscripcion } from "@/lib/api/inscripciones";
import { useAuth } from "@/contexts/AuthContext";

export default function FeedbackParticipanteView() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTallerId, setSelectedTallerId] = useState<string | null>(null);
  const [puntaje, setPuntaje] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participanteId = user?.participanteId;

  useEffect(() => {
    loadInscripciones();
    if (participanteId) {
      loadFeedbacks();
    }
  }, [participanteId]);

  const loadInscripciones = async () => {
    try {
      const data = await inscripcionesApi.getMyInscripciones();
      // Solo mostrar talleres finalizados o en los que está inscrito
      setInscripciones(data.filter(insc => insc.estado === 'FINALIZADO' || insc.estado === 'INSCRITO'));
    } catch (err) {
      console.error('Error cargando inscripciones:', err);
    }
  };

  const loadFeedbacks = async () => {
    if (!participanteId) return;

    try {
      const response = await feedbackApi.getAll({ participanteId });
      setFeedbacks(response.items || []);
    } catch (err) {
      console.error('Error cargando feedbacks:', err);
    }
  };

  const handleDarFeedback = (tallerId: string) => {
    // Verificar si ya dio feedback a este taller
    const yaDioFeedback = feedbacks.some(f => f.tallerId === tallerId);
    if (yaDioFeedback) {
      setError('Ya has dado feedback a este taller');
      return;
    }
    setSelectedTallerId(tallerId);
    setPuntaje(5);
    setComentario('');
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!participanteId || !selectedTallerId) {
      setError('Datos incompletos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createData: CreateFeedbackDto = {
        tallerId: selectedTallerId,
        participanteId,
        puntaje,
        comentario: comentario || undefined,
      };
      await feedbackApi.create(createData);
      setIsDialogOpen(false);
      await loadFeedbacks();
      setSelectedTallerId(null);
      setPuntaje(5);
      setComentario('');
      alert('Feedback enviado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (puntaje: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= puntaje
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
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

  // Filtrar talleres que ya tienen feedback
  const talleresSinFeedback = inscripciones.filter(
    (insc) => !feedbacks.some((f) => f.tallerId === insc.tallerId)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feedback de Talleres</h2>
        <p className="text-muted-foreground">
          Comparte tu opinión sobre los talleres en los que participaste
        </p>
      </div>

      {/* Talleres pendientes de feedback */}
      {talleresSinFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Talleres Pendientes de Feedback</CardTitle>
            <CardDescription>
              Puedes dar feedback a estos talleres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {talleresSinFeedback.map((inscripcion) => (
                <Card key={inscripcion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{inscripcion.taller?.tema || 'Taller'}</CardTitle>
                    <CardDescription>
                      {inscripcion.taller?.modalidad || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleDarFeedback(inscripcion.tallerId)}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Dar Feedback
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedbacks dados */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Feedbacks</CardTitle>
          <CardDescription>
            Feedbacks que has enviado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aún no has dado feedback a ningún taller
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
                        {feedback.taller?.tema || 'Taller'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {feedback.taller?.modalidad || ''}
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

      {/* Dialog para dar feedback */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dar Feedback</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia sobre este taller
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Puntaje</Label>
                <div>{renderStars(puntaje, true, setPuntaje)}</div>
                <p className="text-xs text-muted-foreground">
                  Selecciona de 1 a 5 estrellas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentario">Comentario (opcional)</Label>
                <Textarea
                  id="comentario"
                  name="comentario"
                  placeholder="Comparte tu experiencia, qué te pareció el taller, qué aprendiste..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                />
              </div>

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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

