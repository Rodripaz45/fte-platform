"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Calendar, User } from "lucide-react";
import { participantesApi, type Participante } from "@/lib/api/participantes";

export default function ParticipantesView() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParticipantes();
  }, []);

  const loadParticipantes = async () => {
    try {
      setIsLoading(true);
      const data = await participantesApi.getAll();
      setParticipantes(data);
    } catch (err) {
      console.error('Error cargando participantes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar participantes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewParticipante = (participante: Participante) => {
    setSelectedParticipante(participante);
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Participantes</h2>
        <p className="text-muted-foreground">Lista de participantes registrados</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando participantes...</div>
      ) : participantes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay participantes registrados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {participantes.map((participante) => (
            <Card
              key={participante.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewParticipante(participante)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {participante.usuario?.nombre || 'Sin nombre'}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {participante.usuario?.email || 'Sin email'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Participante</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {participante.documento && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Doc: {participante.documento}</span>
                  </div>
                )}
                {participante.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{participante.telefono}</span>
                  </div>
                )}
                {participante.fechaNac && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(participante.fechaNac)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para ver detalles del participante */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Participante</DialogTitle>
            <DialogDescription>
              Información completa del participante
            </DialogDescription>
          </DialogHeader>
          {selectedParticipante && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="text-lg font-medium">{selectedParticipante.usuario?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-lg">{selectedParticipante.usuario?.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Documento</Label>
                  <p className="text-lg">{selectedParticipante.documento || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-lg">{selectedParticipante.telefono || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Género</Label>
                  <p className="text-lg">{selectedParticipante.genero || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                  <p className="text-lg">{formatDate(selectedParticipante.fechaNac)}</p>
                </div>
              </div>
              {selectedParticipante.usuario?.roles && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Roles</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedParticipante.usuario.roles.map((role) => (
                      <Badge key={role} variant="outline">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

