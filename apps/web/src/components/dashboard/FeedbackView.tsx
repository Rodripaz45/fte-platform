"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Users } from "lucide-react";
import { feedbackApi, type Feedback, type FeedbackResumen } from "@/lib/api/feedback";
import { talleresApi, type Taller } from "@/lib/api/talleres";

export default function FeedbackView() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [selectedTallerId, setSelectedTallerId] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [resumen, setResumen] = useState<FeedbackResumen | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTalleres();
  }, []);

  useEffect(() => {
    if (selectedTallerId) {
      loadFeedbacks();
      loadResumen();
    } else {
      setFeedbacks([]);
      setResumen(null);
    }
  }, [selectedTallerId]);

  const loadTalleres = async () => {
    try {
      const data = await talleresApi.getAll();
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres:', err);
    }
  };

  const loadFeedbacks = async () => {
    if (!selectedTallerId) return;

    try {
      setIsLoading(true);
      const response = await feedbackApi.getAll({ tallerId: selectedTallerId });
      setFeedbacks(response.items || []);
    } catch (err) {
      console.error('Error cargando feedbacks:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumen = async () => {
    if (!selectedTallerId) return;

    try {
      const data = await feedbackApi.getResumen(selectedTallerId);
      setResumen(data);
    } catch (err) {
      console.error('Error cargando resumen:', err);
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

  const selectedTaller = talleres.find(t => t.id === selectedTallerId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feedback</h2>
        <p className="text-muted-foreground">Revisa el feedback de los talleres</p>
      </div>

      {/* Selector de taller */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Taller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="taller-select">Taller</Label>
            <Select value={selectedTallerId} onValueChange={setSelectedTallerId}>
              <SelectTrigger id="taller-select">
                <SelectValue placeholder="Selecciona un taller" />
              </SelectTrigger>
              <SelectContent>
                {talleres.map((taller) => (
                  <SelectItem key={taller.id} value={taller.id}>
                    {taller.tema} - {taller.modalidad}
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

      {selectedTallerId && (
        <>
          {/* Resumen de feedback */}
          {resumen && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                  <Star className="w-5 h-5 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.promedio.toFixed(1)}</div>
                  {renderStars(Math.round(resumen.promedio))}
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
                          <span className="font-medium">{resumen.distribucion[starKey] || 0}</span>
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
              <CardDescription>
                {selectedTaller && (
                  <>
                    Taller: {selectedTaller.tema} - {selectedTaller.modalidad}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Cargando feedbacks...</div>
              ) : feedbacks.length === 0 ? (
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
        </>
      )}
    </div>
  );
}

