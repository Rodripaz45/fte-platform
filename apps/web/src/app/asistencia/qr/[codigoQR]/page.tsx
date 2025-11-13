"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { asistenciasApi } from "@/lib/api/asistencias";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AsistenciaQRPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const codigoQR = params?.codigoQR as string;

  const [estado, setEstado] = useState<"validando" | "registrando" | "exito" | "error">("validando");
  const [mensaje, setMensaje] = useState<string>("");
  const [infoSesion, setInfoSesion] = useState<any>(null);

  useEffect(() => {
    if (!codigoQR) {
      setEstado("error");
      setMensaje("Código QR inválido");
      return;
    }

    // Esperar a que la autenticación termine
    if (authLoading) {
      return;
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/asistencia/qr/${codigoQR}`);
      router.push(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    // Si está autenticado, procesar el registro
    procesarAsistencia();
  }, [codigoQR, isAuthenticated, authLoading, router]);

  const procesarAsistencia = async () => {
    if (!codigoQR) return;

    try {
      setEstado("validando");
      setMensaje("Validando código QR...");

      // Validar el código QR
      const validacion = await asistenciasApi.validarQR(codigoQR);
      setInfoSesion(validacion);

      // Registrar asistencia automáticamente
      setEstado("registrando");
      setMensaje("Registrando asistencia...");

      const asistencia = await asistenciasApi.registrarPorQR(codigoQR);
      
      setEstado("exito");
      setMensaje(
        `¡Asistencia registrada exitosamente! Taller: ${asistencia.sesion?.taller?.tema || "N/A"}`
      );

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      setEstado("error");
      setMensaje(err instanceof Error ? err.message : "Error al registrar asistencia");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {estado === "exito" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
            {estado === "error" && <XCircle className="w-6 h-6 text-destructive" />}
            {(estado === "validando" || estado === "registrando") && (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            )}
            {estado === "validando" && "Validando código QR"}
            {estado === "registrando" && "Registrando asistencia"}
            {estado === "exito" && "¡Asistencia registrada!"}
            {estado === "error" && "Error"}
          </CardTitle>
          <CardDescription>
            {estado === "validando" && "Por favor espera mientras validamos el código..."}
            {estado === "registrando" && "Registrando tu asistencia en el sistema..."}
            {estado === "exito" && "Tu asistencia ha sido registrada correctamente"}
            {estado === "error" && "Hubo un problema al procesar tu asistencia"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {estado === "exito" && infoSesion && (
            <div className="space-y-2 text-sm bg-green-500/10 p-4 rounded-md">
              <div>
                <span className="font-medium">Taller:</span> {infoSesion.taller?.tema || "N/A"}
              </div>
              <div>
                <span className="font-medium">Modalidad:</span> {infoSesion.taller?.modalidad || "N/A"}
              </div>
              <div>
                <span className="font-medium">Fecha:</span>{" "}
                {infoSesion.fecha
                  ? format(new Date(infoSesion.fecha), "PP", { locale: es })
                  : "N/A"}
              </div>
              {infoSesion.horaInicio && (
                <div>
                  <span className="font-medium">Hora:</span>{" "}
                  {format(new Date(infoSesion.horaInicio), "HH:mm", { locale: es })}
                  {infoSesion.horaFin &&
                    ` - ${format(new Date(infoSesion.horaFin), "HH:mm", { locale: es })}`}
                </div>
              )}
            </div>
          )}

          {estado === "error" && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{mensaje}</p>
              </div>
            </div>
          )}

          {estado === "exito" && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
              <p className="text-sm font-medium">{mensaje}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Serás redirigido al dashboard en unos segundos...
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {estado === "error" && (
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Volver al Dashboard
              </Button>
            )}
            {estado === "exito" && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Ir al Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

