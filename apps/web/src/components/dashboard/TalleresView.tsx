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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Users, MapPin, User, Eye, Lock, Award } from "lucide-react";
import { talleresApi, type Taller, type CreateTallerDto, type UpdateTallerDto } from "@/lib/api/talleres";
import { trainersApi, type Trainer } from "@/lib/api/trainers";
import { unidadesEducativasApi, type UnidadEducativa } from "@/lib/api/unidades-educativas";
import { importacionesApi, type ParticipanteImportado } from "@/lib/api/importaciones";
import { useAuth } from "@/contexts/AuthContext";
import Papa from 'papaparse';
import { usePolling } from "@/hooks/usePolling";

interface TalleresViewProps {
  onTallerClick?: (taller: Taller) => void;
}

export default function TalleresView({ onTallerClick }: TalleresViewProps) {
  const { user } = useAuth();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [unidadesEducativas, setUnidadesEducativas] = useState<UnidadEducativa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<Taller | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formModalidad, setFormModalidad] = useState<string>('');
  const [formEstado, setFormEstado] = useState<string>('BORRADOR');
  const [formTrainerId, setFormTrainerId] = useState<string>('');
  const [formTipo, setFormTipo] = useState<string>('NORMAL');
  const [formUnidadEducativaId, setFormUnidadEducativaId] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<ParticipanteImportado[]>([]);

  const isAdmin = user?.roles?.some(role => role === 'ADMIN') ?? false;
  const isTrainer = user?.roles?.some(role => role === 'TRAINER') ?? false;
  const canEdit = isAdmin; // Solo ADMIN puede editar talleres

  useEffect(() => {
    loadTalleres();
    if (canEdit) {
      loadTrainers();
      loadUnidadesEducativas();
    }
  }, [canEdit]);

  // Polling de talleres cada 30 segundos (pausado cuando hay diálogo abierto)
  usePolling(() => {
    loadTalleresSilent();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadTalleres = async () => {
    try {
      setIsLoading(true);
      const data = await talleresApi.getAll();
      // Para trainers, mostrar todos los talleres (NORMAL y UNIDAD_EDUCATIVA)
      // Para admins, también mostrar todos
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar talleres');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTalleresSilent = async () => {
    try {
      const data = await talleresApi.getAll();
      // Para trainers, mostrar todos los talleres (NORMAL y UNIDAD_EDUCATIVA)
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres (silent):', err);
      // No mostrar error en polling silencioso
    }
  };

  const loadTrainers = async () => {
    try {
      const data = await trainersApi.getAll();
      // Filtrar solo trainers activos
      setTrainers(data.filter(t => t.estado === 'ACTIVO'));
    } catch (err) {
      console.error('Error cargando trainers:', err);
    }
  };

  const loadUnidadesEducativas = async () => {
    try {
      const data = await unidadesEducativasApi.getAll();
      setUnidadesEducativas(data);
    } catch (err) {
      console.error('Error cargando unidades educativas:', err);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const participantes: ParticipanteImportado[] = results.data
          .map((row: any) => ({
            nombre: row.nombre || row.Nombre || row.NOMBRE || '',
            documento: row.documento || row.Documento || row.DOCUMENTO || row.cedula || row.Cedula || '',
            email: row.email || row.Email || row.EMAIL || row.correo || row.Correo || '',
            telefono: row.telefono || row.Telefono || row.TELEFONO || row.celular || row.Celular || '',
            genero: row.genero || row.Genero || row.GENERO || '',
            fechaNac: row.fechaNac || row.FechaNac || row['Fecha de Nacimiento'] || '',
          }))
          .filter((p: ParticipanteImportado) => p.nombre.trim() !== '');

        setCsvPreview(participantes);
      },
      error: (error) => {
        console.error('Error al parsear el archivo:', error);
        setError(`Error al parsear el archivo CSV: ${error.message}`);
      },
    });
  };

  const handleCreate = () => {
    setEditingTaller(null);
    setFormModalidad('');
    setFormEstado('BORRADOR');
    setFormTrainerId('');
    setFormTipo('NORMAL');
    setFormUnidadEducativaId('');
    setCsvFile(null);
    setCsvPreview([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (taller: Taller) => {
    setEditingTaller(taller);
    setFormModalidad(taller.modalidad || '');
    setFormEstado(taller.estado || 'BORRADOR');
    setFormTrainerId(taller.trainerId || '');
    setFormTipo(taller.tipo || 'NORMAL');
    setFormUnidadEducativaId(taller.unidadEducativa?.nombre || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este taller?')) return;

    try {
      await talleresApi.delete(id);
      await loadTalleres();
    } catch (err) {
      console.error('Error eliminando taller:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar el taller');
    }
  };

  const handlePublicar = async (id: string) => {
    if (!confirm('¿Estás seguro de publicar este taller? Los participantes podrán inscribirse.')) return;

    try {
      await talleresApi.publicar(id);
      await loadTalleres();
    } catch (err) {
      console.error('Error publicando taller:', err);
      alert(err instanceof Error ? err.message : 'Error al publicar el taller');
    }
  };

  const handleCerrar = async (id: string) => {
    if (!confirm('¿Estás seguro de cerrar este taller? No se podrán realizar nuevas inscripciones.')) return;

    try {
      await talleresApi.cerrar(id);
      await loadTalleres();
    } catch (err) {
      console.error('Error cerrando taller:', err);
      alert(err instanceof Error ? err.message : 'Error al cerrar el taller');
    }
  };

  const handleFinalizar = async (id: string) => {
    if (!confirm('¿Estás seguro de finalizar este taller? Se generarán y enviarán certificados automáticamente a los participantes con al menos 75% de asistencia.')) return;
    try {
      await talleresApi.finalizar(id);
      await loadTalleres();
      alert('Taller finalizado exitosamente. Los certificados se están generando y enviando por email.');
    } catch (err) {
      console.error('Error finalizando taller:', err);
      alert(err instanceof Error ? err.message : 'Error al finalizar el taller');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validar campos requeridos
    if (!formModalidad) {
      setError('La modalidad es requerida');
      setIsSubmitting(false);
      return;
    }

    if (!formTrainerId) {
      setError('El trainer es requerido');
      setIsSubmitting(false);
      return;
    }

    // Validar unidad educativa si el tipo es UNIDAD_EDUCATIVA
    if (formTipo === 'UNIDAD_EDUCATIVA' && !formUnidadEducativaId) {
      setError('La unidad educativa es requerida para talleres de tipo UNIDAD_EDUCATIVA');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const tema = formData.get("tema") as string;

    if (!tema) {
      setError('El tema es requerido');
      setIsSubmitting(false);
      return;
    }

    // Convertir fechas a formato ISO 8601 válido (sin zona horaria)
    // fechaInicioRaw y fechaFinRaw vienen en formato YYYY-MM-DDTHH:MM del input type="datetime-local"
    // Construir strings ISO 8601 completos sin zona horaria para cumplir con @IsDateString
    const fechaInicioRaw = formData.get("fechaInicio") as string;
    const fechaFinRaw = formData.get("fechaFin") as string;
    
    const fechaInicio = fechaInicioRaw 
      ? `${fechaInicioRaw}:00.000`
      : undefined;
    const fechaFin = fechaFinRaw 
      ? `${fechaFinRaw}:00.000`
      : undefined;

    try {
      if (editingTaller) {
        const updateData: UpdateTallerDto = {
          tema,
          modalidad: formModalidad,
          cupos: formData.get("cupos") ? Number(formData.get("cupos")) : undefined,
          fechaInicio,
          fechaFin,
          sede: formData.get("sede") as string || undefined,
          estado: formEstado,
          tipo: formTipo,
          trainerId: formTrainerId,
          unidadEducativaNombre: formTipo === 'UNIDAD_EDUCATIVA' ? formUnidadEducativaId : undefined,
        };
        await talleresApi.update(editingTaller.id, updateData);
      } else {
        const createData: CreateTallerDto = {
          tema,
          modalidad: formModalidad,
          cupos: formData.get("cupos") ? Number(formData.get("cupos")) : undefined,
          fechaInicio,
          fechaFin,
          sede: formData.get("sede") as string || undefined,
          estado: formEstado,
          tipo: formTipo,
          trainerId: formTrainerId,
          unidadEducativaNombre: formTipo === 'UNIDAD_EDUCATIVA' ? formUnidadEducativaId : undefined,
        };
        // Debug: ver qué se está enviando
        console.log('Datos a enviar al crear taller:', createData);
        const nuevoTaller = await talleresApi.create(createData);
        
        // Si es un taller UE y hay un archivo CSV, importarlo automáticamente
        if (formTipo === 'UNIDAD_EDUCATIVA' && csvFile && csvPreview.length > 0) {
          try {
            await importacionesApi.importarLista({
              tallerId: nuevoTaller.id,
              participantes: csvPreview,
            });
          } catch (importError) {
            console.error('Error importando lista:', importError);
            alert('Taller creado, pero hubo un error al importar la lista de participantes. Puedes importarla manualmente después.');
          }
        }
      }
      setIsDialogOpen(false);
      await loadTalleres();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el taller');
    } finally {
      setIsSubmitting(false);
    }
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

  if (isLoading) {
    return <div className="text-center py-8">Cargando talleres...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Talleres</h2>
          <p className="text-muted-foreground">Gestiona los talleres disponibles</p>
        </div>
        {canEdit && (
          <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTaller ? 'Editar Taller' : 'Nuevo Taller'}
                </DialogTitle>
                <DialogDescription>
                  {editingTaller
                    ? 'Modifica la información del taller'
                    : 'Completa los datos para crear un nuevo taller'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tema">Tema *</Label>
                    <Input
                      id="tema"
                      name="tema"
                      defaultValue={editingTaller?.tema}
                      required
                      placeholder="Ej: Marketing Digital"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modalidad">Modalidad *</Label>
                    <Select
                      value={formModalidad}
                      onValueChange={setFormModalidad}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                        <SelectItem value="VIRTUAL">Virtual</SelectItem>
                        <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="modalidad" value={formModalidad} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trainerId">Trainer *</Label>
                    <Select
                      value={formTrainerId}
                      onValueChange={setFormTrainerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.nombre} ({trainer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Taller *</Label>
                    <Select
                      value={formTipo}
                      onValueChange={(value) => {
                        setFormTipo(value);
                        if (value !== 'UNIDAD_EDUCATIVA') {
                          setFormUnidadEducativaId('');
                          setCsvFile(null);
                          setCsvPreview([]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="UNIDAD_EDUCATIVA">Unidad Educativa</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="tipo" value={formTipo} />
                  </div>
                  {formTipo === 'UNIDAD_EDUCATIVA' && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="unidadEducativaNombre">Nombre de la Unidad Educativa *</Label>
                        <Input
                          id="unidadEducativaNombre"
                          name="unidadEducativaNombre"
                          value={formUnidadEducativaId}
                          onChange={(e) => setFormUnidadEducativaId(e.target.value)}
                          placeholder="Ej: Escuela Primaria San José"
                          required
                        />
                      </div>
                      {isAdmin && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="csvFile">Lista de Participantes (CSV) - Opcional</Label>
                            <Input
                              id="csvFile"
                              type="file"
                              accept=".csv"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCsvFile(file);
                                  parseCSV(file);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Puedes cargar la lista de participantes ahora o después de crear el taller
                            </p>
                          </div>
                          {csvPreview.length > 0 && (
                            <div className="space-y-2">
                              <Label>Vista Previa ({csvPreview.length} participantes)</Label>
                              <div className="border rounded-md max-h-40 overflow-y-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="p-2 text-left">Nombre</th>
                                      <th className="p-2 text-left">Documento</th>
                                      <th className="p-2 text-left">Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {csvPreview.slice(0, 5).map((p, idx) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-2">{p.nombre}</td>
                                        <td className="p-2">{p.documento || '-'}</td>
                                        <td className="p-2">{p.email || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {csvPreview.length > 5 && (
                                  <div className="p-2 text-sm text-muted-foreground text-center">
                                    ... y {csvPreview.length - 5} más
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cupos">Cupos</Label>
                      <Input
                        id="cupos"
                        name="cupos"
                        type="number"
                        min="1"
                        defaultValue={editingTaller?.cupos}
                        placeholder="Ej: 30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formEstado}
                        onValueChange={setFormEstado}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BORRADOR">Borrador</SelectItem>
                          <SelectItem value="PUBLICADO">Publicado</SelectItem>
                          <SelectItem value="EN_CURSO">En Curso</SelectItem>
                          <SelectItem value="CERRADO">Cerrado</SelectItem>
                          <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="estado" value={formEstado} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                      <Input
                        id="fechaInicio"
                        name="fechaInicio"
                        type="datetime-local"
                        defaultValue={
                          editingTaller?.fechaInicio
                            ? new Date(editingTaller.fechaInicio).toISOString().slice(0, 16)
                            : ''
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fechaFin">Fecha de Fin</Label>
                      <Input
                        id="fechaFin"
                        name="fechaFin"
                        type="datetime-local"
                        defaultValue={
                          editingTaller?.fechaFin
                            ? new Date(editingTaller.fechaFin).toISOString().slice(0, 16)
                            : ''
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sede">Sede</Label>
                    <Input
                      id="sede"
                      name="sede"
                      defaultValue={editingTaller?.sede}
                      placeholder="Ej: Sede Principal"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Guardando...'
                      : editingTaller
                      ? 'Actualizar'
                      : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Taller
          </Button>
        </>
        )}
      </div>

      {talleres.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay talleres registrados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talleres.map((taller) => (
            <Card 
              key={taller.id} 
              className={`hover:shadow-md transition-shadow ${isTrainer && onTallerClick ? 'cursor-pointer' : ''}`}
              onClick={() => isTrainer && onTallerClick && onTallerClick(taller)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{taller.tema}</CardTitle>
                  <Badge variant={getEstadoBadgeVariant(taller.estado)}>
                    {taller.estado || 'PROGRAMADO'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="w-4 h-4" />
                  {taller.modalidad}
                  {taller.sede && ` • ${taller.sede}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {taller.cupos && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {taller.cupos} cupos
                    </div>
                  )}
                  {taller.fechaInicio && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(taller.fechaInicio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                  {taller.trainer && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Trainer: {taller.trainer.nombre}
                    </div>
                  )}
                </div>
                {/* Botones de edición solo para ADMIN */}
                {canEdit && (
                  <div className="space-y-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(taller)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(taller.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {taller.estado === 'BORRADOR' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublicar(taller.id)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Publicar Taller
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Botones de gestión para ADMIN y TRAINER */}
                {(isAdmin || isTrainer) && (
                  <div className="space-y-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    {(taller.estado === 'PUBLICADO' || taller.estado === 'EN_CURSO' || taller.estado === 'CERRADO') && (
                      <>
                        {taller.estado !== 'CERRADO' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCerrar(taller.id)}
                            className="w-full mb-2"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Cerrar Taller
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFinalizar(taller.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Finalizar Taller
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
