'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Upload, Eye } from 'lucide-react';
import { talleresApi, type Taller } from '@/lib/api/talleres';
import { importacionesApi, type ListaParticipanteUE } from '@/lib/api/importaciones';
import ImportarListaDialog from './ImportarListaDialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePolling } from '@/hooks/usePolling';

export default function TalleresUEView() {
  const { user } = useAuth();
  const [talleresUE, setTalleresUE] = useState<Taller[]>([]);
  const [selectedTaller, setSelectedTaller] = useState<Taller | null>(null);
  const [listaParticipantes, setListaParticipantes] = useState<ListaParticipanteUE[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    loadTalleresUE();
  }, []);

  // Pausar polling cuando hay un diálogo abierto o cuando se está viendo un taller específico
  usePolling(() => {
    if (!showImportDialog && !selectedTaller) {
      loadTalleresUE();
    }
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadTalleresUE = async () => {
    try {
      setIsLoading(true);
      const talleres = await talleresApi.getAll();
      // Filtrar solo talleres de tipo UNIDAD_EDUCATIVA del trainer actual
      const filtered = talleres.filter(
        t => t.tipo === 'UNIDAD_EDUCATIVA' && t.trainerId === user?.id
      );
      setTalleresUE(filtered);
    } catch (err) {
      console.error('Error cargando talleres UE:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadListaParticipantes = async (tallerId: string) => {
    try {
      const lista = await importacionesApi.obtenerLista(tallerId);
      setListaParticipantes(lista);
    } catch (err) {
      console.error('Error cargando lista de participantes:', err);
    }
  };

  const handleTallerClick = async (taller: Taller) => {
    setSelectedTaller(taller);
    await loadListaParticipantes(taller.id);
  };

  const handleImportComplete = async () => {
    if (selectedTaller) {
      await loadListaParticipantes(selectedTaller.id);
    }
    setShowImportDialog(false);
  };

  const getEstadoBadgeVariant = (estado?: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'secondary';
      case 'PUBLICADO':
        return 'default';
      case 'EN_CURSO':
        return 'default';
      case 'CERRADO':
        return 'secondary';
      case 'FINALIZADO':
        return 'outline';
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando talleres...</div>;
  }

  if (selectedTaller) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedTaller(null)}
              className="mb-2"
            >
              ← Volver
            </Button>
            <h2 className="text-2xl font-bold">{selectedTaller.tema}</h2>
            <p className="text-muted-foreground">
              {selectedTaller.unidadEducativa?.nombre || 'Sin unidad educativa'}
            </p>
          </div>
          <Button onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Lista
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Taller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Modalidad</p>
                <p className="font-medium">{selectedTaller.modalidad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={getEstadoBadgeVariant(selectedTaller.estado)}>
                  {selectedTaller.estado || 'Sin estado'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                <p className="font-medium">{formatDate(selectedTaller.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                <p className="font-medium">{formatDate(selectedTaller.fechaFin)}</p>
              </div>
              {selectedTaller.sede && (
                <div>
                  <p className="text-sm text-muted-foreground">Sede</p>
                  <p className="font-medium">{selectedTaller.sede}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Participantes</CardTitle>
            <CardDescription>
              {listaParticipantes.length} participante(s) registrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listaParticipantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay participantes registrados</p>
                <p className="text-sm mt-2">Importa una lista para comenzar</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Documento</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Teléfono</th>
                      <th className="p-3 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaParticipantes.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.nombre}</td>
                        <td className="p-3">{p.documento || '-'}</td>
                        <td className="p-3">{p.email || '-'}</td>
                        <td className="p-3">{p.telefono || '-'}</td>
                        <td className="p-3">
                          <Badge variant={p.estado === 'ASISTIO' ? 'default' : 'secondary'}>
                            {p.estado || 'PENDIENTE'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {showImportDialog && selectedTaller && (
          <ImportarListaDialog
            tallerId={selectedTaller.id}
            taller={selectedTaller}
            onImportComplete={handleImportComplete}
            onClose={() => setShowImportDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Talleres de Unidad Educativa</h2>
        <p className="text-muted-foreground">
          Gestiona los talleres asignados a unidades educativas
        </p>
      </div>

      {talleresUE.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tienes talleres de Unidad Educativa asignados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talleresUE.map((taller) => (
            <Card
              key={taller.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTallerClick(taller)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{taller.tema}</CardTitle>
                  <Badge variant={getEstadoBadgeVariant(taller.estado)}>
                    {taller.estado || 'Sin estado'}
                  </Badge>
                </div>
                <CardDescription>
                  {taller.unidadEducativa?.nombre || 'Sin unidad educativa'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(taller.fechaInicio)} - {formatDate(taller.fechaFin)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{taller.modalidad}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

