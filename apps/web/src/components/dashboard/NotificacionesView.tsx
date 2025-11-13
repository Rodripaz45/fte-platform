"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import { notificacionesApi, type Notificacion, EstadoNotificacion, TipoNotificacion } from "@/lib/api/notificaciones";
import { usePolling } from "@/hooks/usePolling";

export default function NotificacionesView() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countNoLeidas, setCountNoLeidas] = useState(0);

  useEffect(() => {
    loadNotificaciones();
    loadCountNoLeidas();
  }, []);

  // Polling cada 30 segundos para actualizar notificaciones
  usePolling(() => {
    loadNotificaciones();
    loadCountNoLeidas();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  const loadNotificaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const todas = await notificacionesApi.getMisNotificaciones({ limit: 100 });
      const noLeidasData = await notificacionesApi.getMisNotificaciones({ soloNoLeidas: true, limit: 100 });
      
      setNotificaciones(todas);
      setNoLeidas(noLeidasData);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountNoLeidas = async () => {
    try {
      const count = await notificacionesApi.countNoLeidas();
      setCountNoLeidas(count);
    } catch (err) {
      console.error('Error contando notificaciones:', err);
    }
  };

  const handleMarcarComoLeida = async (id: string) => {
    try {
      await notificacionesApi.marcarComoLeida(id);
      await loadNotificaciones();
      await loadCountNoLeidas();
    } catch (err) {
      console.error('Error marcando notificación:', err);
      alert(err instanceof Error ? err.message : 'Error al marcar notificación');
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasComoLeidas();
      await loadNotificaciones();
      await loadCountNoLeidas();
    } catch (err) {
      console.error('Error marcando notificaciones:', err);
      alert(err instanceof Error ? err.message : 'Error al marcar notificaciones');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    try {
      await notificacionesApi.delete(id);
      await loadNotificaciones();
      await loadCountNoLeidas();
    } catch (err) {
      console.error('Error eliminando notificación:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar notificación');
    }
  };

  const getTipoIcon = (tipo?: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.RECORDATORIO_SESION:
        return <Calendar className="w-4 h-4" />;
      case TipoNotificacion.CONFIRMACION_INSCRIPCION:
        return <Check className="w-4 h-4" />;
      case TipoNotificacion.NUEVO_TALLER:
        return <Info className="w-4 h-4" />;
      case TipoNotificacion.RECORDATORIO_ENCUESTA:
        return <MessageSquare className="w-4 h-4" />;
      case TipoNotificacion.ASISTENCIA_REGISTRADA:
        return <CheckCheck className="w-4 h-4" />;
      case TipoNotificacion.TALLER_CANCELADO:
      case TipoNotificacion.TALLER_MODIFICADO:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo?: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.RECORDATORIO_SESION:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case TipoNotificacion.CONFIRMACION_INSCRIPCION:
        return "bg-green-100 text-green-800 border-green-300";
      case TipoNotificacion.NUEVO_TALLER:
        return "bg-purple-100 text-purple-800 border-purple-300";
      case TipoNotificacion.RECORDATORIO_ENCUESTA:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case TipoNotificacion.ASISTENCIA_REGISTRADA:
        return "bg-green-100 text-green-800 border-green-300";
      case TipoNotificacion.TALLER_CANCELADO:
        return "bg-red-100 text-red-800 border-red-300";
      case TipoNotificacion.TALLER_MODIFICADO:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNotificacion = (notificacion: Notificacion) => {
    const isLeida = notificacion.estado === EstadoNotificacion.LEIDA;

    return (
      <Card
        key={notificacion.id}
        className={`border-l-4 ${
          isLeida
            ? 'border-l-gray-300 bg-gray-50'
            : 'border-l-primary bg-white'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTipoIcon(notificacion.tipo)}
                <CardTitle className={`text-base ${isLeida ? 'text-gray-600' : ''}`}>
                  {notificacion.titulo || 'Notificación'}
                </CardTitle>
              </div>
              {notificacion.tipo && (
                <Badge variant="outline" className={`text-xs ${getTipoColor(notificacion.tipo)}`}>
                  {notificacion.tipo.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(notificacion.creadoEn)}
              </span>
            </div>
          </div>
        </CardHeader>
        {notificacion.mensaje && (
          <CardContent>
            <p className={`text-sm ${isLeida ? 'text-gray-600' : 'text-gray-800'}`}>
              {notificacion.mensaje}
            </p>
            <div className="flex gap-2 mt-4">
              {!isLeida && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarcarComoLeida(notificacion.id)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como leída
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEliminar(notificacion.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando notificaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notificaciones</h2>
          <p className="text-muted-foreground">
            Gestiona tus notificaciones y alertas
          </p>
        </div>
        {countNoLeidas > 0 && (
          <Button onClick={handleMarcarTodasComoLeidas} variant="outline">
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como leídas ({countNoLeidas})
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <Tabs defaultValue="no-leidas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="no-leidas" className="gap-2">
            <Bell className="w-4 h-4" />
            No Leídas
            {countNoLeidas > 0 && (
              <Badge variant="destructive" className="ml-2">
                {countNoLeidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todas" className="gap-2">
            <BellOff className="w-4 h-4" />
            Todas ({notificaciones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="no-leidas" className="space-y-4">
          {noLeidas.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No tienes notificaciones no leídas
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {noLeidas.map(renderNotificacion)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          {notificaciones.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No tienes notificaciones
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notificaciones.map(renderNotificacion)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

