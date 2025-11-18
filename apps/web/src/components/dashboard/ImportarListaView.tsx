'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { importacionesApi, type ParticipanteImportado, type ResultadoImportacion } from '@/lib/api/importaciones';
import { talleresApi, type Taller } from '@/lib/api/talleres';
import Papa from 'papaparse';

interface ImportarListaViewProps {
  tallerId?: string;
  taller?: Taller; // Taller completo para mostrar su nombre
  onImportComplete?: () => void;
  onClose?: () => void;
  showHeader?: boolean; // Para mostrar/ocultar el header con el botón
}

export default function ImportarListaView({ tallerId, taller, onImportComplete, onClose, showHeader = true }: ImportarListaViewProps) {
  const [talleresUE, setTalleresUE] = useState<Taller[]>([]);
  const [selectedTallerId, setSelectedTallerId] = useState<string>(tallerId || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParticipanteImportado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(!showHeader); // Si no hay header, abrir diálogo automáticamente

  useEffect(() => {
    if (showHeader) {
      loadTalleresUE();
    } else {
      // Si no hay header, el diálogo se abre automáticamente
      setIsDialogOpen(true);
      // Cargar talleres UE para obtener la información del taller si hay tallerId
      if (tallerId) {
        setSelectedTallerId(tallerId);
        loadTalleresUE();
      } else {
        loadTalleresUE();
      }
    }
  }, [showHeader, tallerId]);

  const loadTalleresUE = async () => {
    try {
      setIsLoading(true);
      const talleres = await talleresApi.getAll();
      // Filtrar solo talleres de tipo UNIDAD_EDUCATIVA
      const filtered = talleres.filter(t => t.tipo === 'UNIDAD_EDUCATIVA');
      setTalleresUE(filtered);
      
      // Si tenemos tallerId, asegurarnos de que esté en la lista
      if (tallerId) {
        setSelectedTallerId(tallerId);
        const tallerEncontrado = filtered.find(t => t.id === tallerId);
        if (!tallerEncontrado) {
          // Si no está en la lista filtrada, obtenerlo directamente
          try {
            const tallerCompleto = await talleresApi.getById(tallerId);
            if (tallerCompleto.tipo === 'UNIDAD_EDUCATIVA') {
              setTalleresUE([tallerCompleto, ...filtered]);
            }
          } catch (e) {
            console.error('Error obteniendo taller:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error cargando talleres UE:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar talleres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar extensión
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setError('Solo se permiten archivos CSV o Excel (.csv, .xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResultado(null);

    // Parsear archivo
    if (ext === 'csv') {
      parseCSV(selectedFile);
    } else {
      setError('Los archivos Excel (.xlsx, .xls) aún no están soportados. Por favor, exporta a CSV.');
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

        setPreview(participantes);
        if (participantes.length === 0) {
          setError('No se encontraron participantes válidos en el archivo');
        }
      },
      error: (error) => {
        setError(`Error al parsear el archivo: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!selectedTallerId) {
      setError('Debes seleccionar un taller');
      return;
    }

    if (preview.length === 0) {
      setError('No hay participantes para importar');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      const resultado = await importacionesApi.importarLista({
        tallerId: selectedTallerId,
        participantes: preview,
      });
      setResultado(resultado);
      if (onImportComplete) {
        onImportComplete();
      }
      // Cerrar diálogo después de importar exitosamente
      setTimeout(() => {
        setIsDialogOpen(false);
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error('Error importando lista:', err);
      setError(err instanceof Error ? err.message : 'Error al importar la lista');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setResultado(null);
    setError(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <>
      {showHeader && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Importar Lista de Participantes</h2>
              <p className="text-muted-foreground">
                Importa listas de participantes desde archivos CSV para talleres de Unidad Educativa
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Lista
            </Button>
          </div>

          {isLoading && <div className="text-center py-8">Cargando talleres...</div>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Lista de Participantes</DialogTitle>
            <DialogDescription>
              Selecciona un taller de tipo Unidad Educativa y carga un archivo CSV con los participantes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resultado && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p><strong>Total procesados:</strong> {resultado.total}</p>
                    <p><strong>Creados:</strong> {resultado.creados}</p>
                    <p><strong>Duplicados:</strong> {resultado.duplicados}</p>
                    {resultado.errores.length > 0 && (
                      <div>
                        <p><strong>Errores:</strong> {resultado.errores.length}</p>
                        <ul className="list-disc list-inside text-sm">
                          {resultado.errores.slice(0, 5).map((err, idx) => (
                            <li key={idx}>Fila {err.fila}: {err.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="tallerId">Taller (Unidad Educativa) *</Label>
              {tallerId ? (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {taller?.tema || talleresUE.find(t => t.id === tallerId)?.tema || 'Taller seleccionado'}
                </div>
              ) : (
                <select
                  id="tallerId"
                  value={selectedTallerId}
                  onChange={(e) => setSelectedTallerId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Selecciona un taller</option>
                  {talleresUE.map((taller) => (
                    <option key={taller.id} value={taller.id}>
                      {taller.tema} - {taller.unidadEducativa?.nombre || 'Sin unidad'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {!file && (
              <div className="grid gap-2">
                <Label htmlFor="file">Archivo CSV *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  El archivo debe tener columnas: nombre, documento, email, telefono, genero, fechaNac
                </p>
              </div>
            )}

            {file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {preview.length > 0 && (
              <div className="space-y-2">
                <Label>Vista Previa ({preview.length} participantes)</Label>
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Documento</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((p, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{p.nombre}</td>
                          <td className="p-2">{p.documento || '-'}</td>
                          <td className="p-2">{p.email || '-'}</td>
                          <td className="p-2">{p.telefono || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      ... y {preview.length - 10} más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                setIsDialogOpen(false);
                if (onClose) {
                  onClose();
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!selectedTallerId || preview.length === 0 || isImporting}
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

