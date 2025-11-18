'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Mail, Calendar, BookOpen, CheckCircle2, RefreshCw } from 'lucide-react';
import { certificadosApi, type Certificado } from '@/lib/api/certificados';
import { useAuth } from '@/contexts/AuthContext';
import { usePolling } from '@/hooks/usePolling';

export default function CertificadosView() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(role => role === 'ADMIN') ?? false;
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);
  const [regenerandoId, setRegenerandoId] = useState<string | null>(null);

  useEffect(() => {
    loadCertificados();
  }, []);

  // Polling cada 60 segundos
  usePolling(() => {
    loadCertificadosSilent();
  }, { interval: 60000, pauseWhenDialogOpen: true });

  const loadCertificados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Si es admin, cargar todos los certificados; si no, solo los del participante
      const data = isAdmin 
        ? await certificadosApi.getAll()
        : await certificadosApi.getMisCertificados();
      setCertificados(data);
    } catch (err) {
      console.error('Error cargando certificados:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar certificados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCertificadosSilent = async () => {
    try {
      // Si es admin, cargar todos los certificados; si no, solo los del participante
      const data = isAdmin 
        ? await certificadosApi.getAll()
        : await certificadosApi.getMisCertificados();
      setCertificados(data);
    } catch (err) {
      console.error('Error cargando certificados (silent):', err);
    }
  };

  const handleReenviarEmail = async (certificadoId: string) => {
    try {
      setReenviandoId(certificadoId);
      await certificadosApi.reenviarPorEmail(certificadoId);
      alert('Certificado reenviado por email exitosamente');
      // Recargar certificados
      await loadCertificados();
    } catch (err) {
      console.error('Error reenviando certificado:', err);
      alert(err instanceof Error ? err.message : 'Error al reenviar el certificado');
    } finally {
      setReenviandoId(null);
    }
  };

  const handleRegenerar = async (certificadoId: string) => {
    if (!confirm('¿Estás seguro de regenerar este certificado? Se regenerará el PDF y se reenviará por email.')) {
      return;
    }
    try {
      setRegenerandoId(certificadoId);
      await certificadosApi.regenerar(certificadoId);
      alert('Certificado regenerado y reenviado exitosamente');
      // Recargar certificados
      await loadCertificados();
    } catch (err) {
      console.error('Error regenerando certificado:', err);
      alert(err instanceof Error ? err.message : 'Error al regenerar el certificado');
    } finally {
      setRegenerandoId(null);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Cargando certificados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6" />
            {isAdmin ? 'Todos los Certificados' : 'Mis Certificados'}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Gestión de todos los certificados emitidos en el sistema'
              : 'Certificados de participación en talleres completados'}
          </p>
        </div>
      </div>

      {certificados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes certificados aún</h3>
            <p className="text-muted-foreground">
              Los certificados se generan automáticamente cuando completas un taller con al menos 75% de asistencia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certificados.map((certificado) => (
            <Card key={certificado.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {certificado.taller?.tema || 'Taller'}
                    </CardTitle>
                    {isAdmin && certificado.participante?.usuario && (
                      <CardDescription className="mt-1">
                        <span className="text-sm font-medium">
                          Participante: {certificado.participante.usuario.nombre}
                        </span>
                        {certificado.participante.usuario.email && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({certificado.participante.usuario.email})
                          </span>
                        )}
                      </CardDescription>
                    )}
                    <div className="mt-2">
                      {certificado.taller?.modalidad && (
                        <Badge variant="outline" className="mr-2">
                          {certificado.taller.modalidad}
                        </Badge>
                      )}
                      {certificado.taller?.fechaInicio && certificado.taller?.fechaFin && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(certificado.taller.fechaInicio)} - {formatDate(certificado.taller.fechaFin)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {certificado.enviadoPorEmail ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Enviado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Código de verificación:</p>
                      <p className="font-mono font-semibold">{certificado.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Emitido el:</p>
                      <p>{formatDate(certificado.emitidoEn)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {certificado.urlPDF && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(certificado.urlPDF!, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReenviarEmail(certificado.id)}
                      disabled={reenviandoId === certificado.id || regenerandoId === certificado.id}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {reenviandoId === certificado.id ? 'Reenviando...' : 'Reenviar por Email'}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRegenerar(certificado.id)}
                        disabled={reenviandoId === certificado.id || regenerandoId === certificado.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${regenerandoId === certificado.id ? 'animate-spin' : ''}`} />
                        {regenerandoId === certificado.id ? 'Regenerando...' : 'Regenerar'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

