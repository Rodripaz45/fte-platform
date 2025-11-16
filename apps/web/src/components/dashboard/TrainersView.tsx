"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Mail, User, Calendar } from "lucide-react";
import { trainersApi, type Trainer, type CreateTrainerDto, type UpdateTrainerDto } from "@/lib/api/trainers";
import { usePolling } from "@/hooks/usePolling";

export default function TrainersView() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<CreateTrainerDto>({
    nombre: "",
    email: "",
    password: "",
    estado: "ACTIVO",
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  // Polling cada 30 segundos (pausado cuando hay diálogo abierto)
  usePolling(() => {
    loadTrainersSilent();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getAll();
      setTrainers(data);
    } catch (err) {
      console.error('Error cargando trainers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainersSilent = async () => {
    try {
      const data = await trainersApi.getAll();
      setTrainers(data);
    } catch (err) {
      console.error('Error cargando trainers (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const handleOpenDialog = (trainer?: Trainer) => {
    if (trainer) {
      setIsEditMode(true);
      setSelectedTrainer(trainer);
      setFormData({
        nombre: trainer.nombre,
        email: trainer.email,
        password: "",
        estado: trainer.estado || "ACTIVO",
      });
    } else {
      setIsEditMode(false);
      setSelectedTrainer(null);
      setFormData({
        nombre: "",
        email: "",
        password: "",
        estado: "ACTIVO",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTrainer(null);
    setFormData({
      nombre: "",
      email: "",
      password: "",
      estado: "ACTIVO",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditMode && selectedTrainer) {
        const updateData: UpdateTrainerDto = {
          nombre: formData.nombre,
          email: formData.email,
          estado: formData.estado,
        };
        // Solo incluir password si se proporcionó
        if (formData.password && formData.password.length > 0) {
          updateData.password = formData.password;
        }
        await trainersApi.update(selectedTrainer.id, updateData);
      } else {
        await trainersApi.create(formData);
      }
      handleCloseDialog();
      await loadTrainers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar trainer');
    }
  };

  const handleDelete = async (trainer: Trainer) => {
    if (!confirm(`¿Estás seguro de desactivar al trainer ${trainer.nombre}?`)) {
      return;
    }

    try {
      await trainersApi.delete(trainer.id);
      await loadTrainers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar trainer');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Trainers</h2>
          <p className="text-muted-foreground">
            Administra los usuarios con rol de capacitador
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Trainer
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando trainers...</div>
      ) : trainers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay trainers registrados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {trainer.nombre}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {trainer.email}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={trainer.estado === 'ACTIVO' ? 'default' : 'secondary'}
                  >
                    {trainer.estado || 'ACTIVO'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Creado: {formatDate(trainer.creadoEn)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(trainer)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(trainer)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Desactivar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Trainer' : 'Nuevo Trainer'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Modifica la información del trainer'
                : 'Completa los datos para crear un nuevo trainer'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Contraseña {isEditMode ? '(dejar vacío para no cambiar)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!isEditMode}
                  minLength={6}
                  placeholder={isEditMode ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) =>
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

