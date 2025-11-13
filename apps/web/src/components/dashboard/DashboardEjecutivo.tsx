"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Calendar,
  Star,
  Download,
  RefreshCw,
} from "lucide-react";
import { reportesApi, type FiltrosReporte, type DashboardEjecutivo as DashboardData } from "@/lib/api/reportes";
import { talleresApi, type Taller } from "@/lib/api/talleres";
import { usePolling } from "@/hooks/usePolling";

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardEjecutivo() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: undefined,
    fechaFin: undefined,
    modalidad: undefined,
    tallerId: undefined,
  });

  useEffect(() => {
    loadTalleres();
    loadDashboard();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [filtros]);

  // Polling del dashboard cada 30 segundos
  usePolling(() => {
    loadDashboard();
  }, { interval: 30000, pauseWhenDialogOpen: true });

  // Polling de talleres cada 60 segundos (menos frecuente)
  usePolling(() => {
    loadTalleres();
  }, { interval: 60000, pauseWhenDialogOpen: true });

  const loadTalleres = async () => {
    try {
      const data = await talleresApi.getAll();
      setTalleres(data);
    } catch (err) {
      console.error('Error cargando talleres:', err);
    }
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reportesApi.getDashboardEjecutivo(filtros);
      setDashboardData(data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportarCSV = async (tipo: 'inscripciones' | 'asistencia' | 'satisfaccion') => {
    try {
      const blob = await reportesApi.exportarCSV(tipo, filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exportando CSV:', err);
      alert('Error al exportar el reporte');
    }
  };

  const handleResetFiltros = () => {
    setFiltros({
      fechaInicio: undefined,
      fechaFin: undefined,
      modalidad: undefined,
      tallerId: undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Cargando dashboard...</div>
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

  if (!dashboardData) {
    return null;
  }

  // Preparar datos para gráficos
  const datosAsistencia = dashboardData.asistencia.map((item) => ({
    nombre: item.tema.length > 20 ? item.tema.substring(0, 20) + '...' : item.tema,
    tasa: item.tasaAsistencia,
    inscripciones: item.totalInscripciones,
  }));

  const datosSatisfaccion = dashboardData.satisfaccion.map((item) => ({
    nombre: item.tema.length > 20 ? item.tema.substring(0, 20) + '...' : item.tema,
    promedio: item.promedioSatisfaccion,
    total: item.totalFeedbacks,
  }));

  const datosDistribucionModalidad = dashboardData.asistencia.reduce((acc, item) => {
    const key = item.modalidad || 'Sin modalidad';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const datosPieModalidad = Object.entries(datosDistribucionModalidad).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
          <p className="text-muted-foreground">
            Indicadores y métricas de los talleres
          </p>
        </div>
        <Button onClick={loadDashboard} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtrar datos por periodo, modalidad o taller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaInicio: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={filtros.fechaFin || ''}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaFin: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modalidad">Modalidad</Label>
              <Select
                value={filtros.modalidad || ''}
                onValueChange={(value) =>
                  setFiltros({ ...filtros, modalidad: value || undefined })
                }
              >
                <SelectTrigger id="modalidad">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="MIXTA">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taller">Taller</Label>
              <Select
                value={filtros.tallerId || ''}
                onValueChange={(value) =>
                  setFiltros({ ...filtros, tallerId: value || undefined })
                }
              >
                <SelectTrigger id="taller">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {talleres.map((taller) => (
                    <SelectItem key={taller.id} value={taller.id}>
                      {taller.tema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleResetFiltros} variant="outline" size="sm">
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.resumen.promedioAsistencia.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasa promedio de asistencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.resumen.promedioSatisfaccion.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Puntaje promedio de satisfacción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Recurrencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.resumen.tasaRecurrencia.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Participantes recurrentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.resumen.cobertura}
            </div>
            <p className="text-xs text-muted-foreground">
              Participantes únicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Asistencia */}
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Asistencia por Taller</CardTitle>
            <CardDescription>Porcentaje de asistencia por taller</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosAsistencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasa" fill="#2563eb" name="Tasa de Asistencia (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Satisfacción */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfacción por Taller</CardTitle>
            <CardDescription>Promedio de satisfacción por taller</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosSatisfaccion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#10b981"
                  name="Promedio Satisfacción"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribución por Modalidad */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Modalidad</CardTitle>
            <CardDescription>Cantidad de talleres por modalidad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosPieModalidad}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosPieModalidad.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detalles de Recurrencia */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Recurrencia</CardTitle>
            <CardDescription>Participantes recurrentes vs únicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Participantes</span>
                <Badge variant="outline">{dashboardData.recurrencia.totalParticipantes}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Participantes Recurrentes</span>
                <Badge variant="default">
                  {dashboardData.recurrencia.participantesRecurrentes}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Participantes Únicos</span>
                <Badge variant="secondary">
                  {dashboardData.recurrencia.participantesUnicos}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <div className="text-2xl font-bold">
                  {dashboardData.recurrencia.tasaRecurrencia.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Tasa de recurrencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exportación */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reportes</CardTitle>
          <CardDescription>Descargar reportes en formato CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExportarCSV('inscripciones')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Inscripciones
            </Button>
            <Button onClick={() => handleExportarCSV('asistencia')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Asistencia
            </Button>
            <Button onClick={() => handleExportarCSV('satisfaccion')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Satisfacción
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

