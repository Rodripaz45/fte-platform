"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Clock, Sparkles } from "lucide-react";
import { iaApi, type AnalyzeJobResponse, type CompetenciaJobResult } from "@/lib/api/ia";

export default function BusquedaPuestosView() {
  const [puestoTexto, setPuestoTexto] = useState("");
  const [topK, setTopK] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<AnalyzeJobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const response = await iaApi.analyzeJob({
        puestoTexto,
        topK: topK || 6,
      });
      setResultado(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar el puesto");
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanciaColor = (relevancia: number) => {
    if (relevancia >= 0.8) return "bg-green-100 text-green-800 border-green-300";
    if (relevancia >= 0.6) return "bg-blue-100 text-blue-800 border-blue-300";
    if (relevancia >= 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Búsqueda de Puestos de Trabajo</h2>
        <p className="text-muted-foreground">
          Analiza las competencias requeridas para un puesto de trabajo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analizar Puesto</CardTitle>
          <CardDescription>
            Ingresa la descripción del puesto de trabajo para obtener las competencias requeridas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="puestoTexto">Descripción del Puesto *</Label>
              <Textarea
                id="puestoTexto"
                value={puestoTexto}
                onChange={(e) => setPuestoTexto(e.target.value)}
                placeholder="Ej: Coordinador de operaciones para servicios de atención al público. Responsabilidades: coordinar agendas, asegurar protocolos de servicio, seguimiento de indicadores, coordinación con logística y compras, mejora de procesos. Competencias: liderazgo, comunicación, orientación al usuario, planificación, uso de hojas de cálculo."
                required
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topK">Número de Competencias a Mostrar</Label>
              <Input
                id="topK"
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                placeholder="6"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo: 1, Máximo: 20 (por defecto: 6)
              </p>
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isLoading || !puestoTexto.trim()}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Analizando..." : "Analizar Puesto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Competencias Encontradas</CardTitle>
                <CardDescription>
                  {resultado.competencias.length} competencias identificadas
                </CardDescription>
              </div>
              {resultado.meta.tiempo && (
                <Badge variant="outline" className="gap-2">
                  <Clock className="w-3 h-3" />
                  {resultado.meta.tiempo.toFixed(2)}s
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resultado.competencias.map((competencia, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          {competencia.competencia}
                        </CardTitle>
                        {competencia.descripcion && (
                          <CardDescription className="mt-2">
                            {competencia.descripcion}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-4 ${getRelevanciaColor(competencia.relevancia)}`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {(competencia.relevancia * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${competencia.relevancia * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
