"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { participantesApi, type CreateParticipanteDto } from "@/lib/api/participantes";

interface CompletarPerfilModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function CompletarPerfilModal({
  open,
  onComplete,
}: CompletarPerfilModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateParticipanteDto>({
    documento: "",
    telefono: "",
    genero: "",
    fechaNac: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Crear el perfil de participante
      await participantesApi.createMyProfile(formData);
      
      // Llamar al callback para que el componente padre actualice el usuario
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el perfil');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateParticipanteDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value || undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={() => {
      // No permitir cerrar el modal hasta que se complete el perfil
      // El modal solo se cierra cuando onComplete es llamado exitosamente
    }}>
      <DialogContent className="max-w-2xl" preventClose={true}>
        <DialogHeader>
          <DialogTitle>Completar Perfil de Participante</DialogTitle>
          <DialogDescription>
            Para continuar usando la plataforma, necesitamos que completes tu perfil de participante.
            Todos los campos son opcionales, pero te recomendamos completarlos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento de Identidad</Label>
              <Input
                id="documento"
                name="documento"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.documento || ""}
                onChange={(e) => handleChange("documento", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Ej: +57 300 123 4567"
                value={formData.telefono || ""}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Género</Label>
              <Select
                value={formData.genero || ""}
                onValueChange={(value) => handleChange("genero", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                  <SelectItem value="PREFIERO_NO_DECIR">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNac">Fecha de Nacimiento</Label>
              <Input
                id="fechaNac"
                name="fechaNac"
                type="date"
                value={formData.fechaNac || ""}
                onChange={(e) => handleChange("fechaNac", e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando perfil...' : 'Completar Perfil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

