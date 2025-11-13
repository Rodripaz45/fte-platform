"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle2, XCircle, AlertCircle, Camera, X } from "lucide-react";
import { asistenciasApi } from "@/lib/api/asistencias";
import { sesionesApi } from "@/lib/api/sesiones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";

export default function EscanearQRView() {
  const [codigoQR, setCodigoQR] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validacionInfo, setValidacionInfo] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  const handleValidarQR = async () => {
    if (!codigoQR.trim()) {
      setError("Por favor, ingresa un código QR");
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(null);
    setValidacionInfo(null);

    try {
      const info = await sesionesApi.validarQR(codigoQR);
      setValidacionInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código QR inválido o expirado");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegistrarAsistencia = async () => {
    if (!codigoQR.trim()) {
      setError("Por favor, ingresa un código QR");
      return;
    }

    setIsRegistrando(true);
    setError(null);
    setSuccess(null);

    try {
      const asistencia = await asistenciasApi.registrarPorQR(codigoQR);
      setSuccess(
        `¡Asistencia registrada exitosamente! Taller: ${asistencia.sesion?.taller?.tema || "N/A"}`
      );
      setCodigoQR("");
      setValidacionInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar asistencia");
    } finally {
      setIsRegistrando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setCodigoQR(value);
    setError(null);
    setSuccess(null);
    setValidacionInfo(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text").trim();
    if (pastedText) {
      setCodigoQR(pastedText);
      // Auto-validar si parece un código QR (32 caracteres hexadecimales)
      if (/^[a-f0-9]{32}$/i.test(pastedText)) {
        setTimeout(() => {
          handleValidarQR();
        }, 100);
      }
    }
  };

  // Función para iniciar el escáner
  const startScanner = async () => {
    try {
      setScanError(null);
      setIsScanning(true);
      
      // Esperar a que el elemento se renderice en el DOM
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20; // Máximo 1 segundo (20 * 50ms)
        
        const checkElement = () => {
          const element = document.getElementById(qrCodeRegionId);
          if (element) {
            resolve();
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error("Timeout esperando el elemento del escáner"));
            } else {
              setTimeout(checkElement, 50);
            }
          }
        };
        checkElement();
      });

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      // Detectar si es móvil para ajustar el tamaño del qrbox
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const qrboxSize = isMobile 
        ? { width: Math.min(250, window.innerWidth * 0.8), height: Math.min(250, window.innerWidth * 0.8) }
        : { width: 250, height: 250 };

      // Intentar primero con cámara trasera (environment)
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: qrboxSize,
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Código escaneado exitosamente
            handleQRScanned(decodedText);
          },
          (errorMessage) => {
            // Ignorar errores de escaneo continuo (solo logs)
            // console.debug("Escaneando...", errorMessage);
          }
        );
      } catch (envError: any) {
        // Si falla con cámara trasera, intentar con cámara frontal
        console.log("Error con cámara trasera, intentando frontal:", envError);
        try {
          await html5QrCode.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: qrboxSize,
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleQRScanned(decodedText);
            },
            (errorMessage) => {
              // Ignorar errores de escaneo continuo
            }
          );
        } catch (userError: any) {
          // Si ambas fallan, intentar sin especificar facingMode
          console.log("Error con cámara frontal, intentando sin especificar:", userError);
          await html5QrCode.start(
            { deviceId: undefined }, // Dejar que el navegador elija
            {
              fps: 10,
              qrbox: qrboxSize,
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleQRScanned(decodedText);
            },
            (errorMessage) => {
              // Ignorar errores de escaneo continuo
            }
          );
        }
      }
    } catch (err: any) {
      let errorMsg = "Error al iniciar la cámara";
      
      if (err?.message) {
        if (err.message.includes("Permission denied") || err.message.includes("NotAllowedError")) {
          errorMsg = "Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.";
        } else if (err.message.includes("NotFoundError") || err.message.includes("No camera")) {
          errorMsg = "No se encontró ninguna cámara en tu dispositivo.";
        } else if (err.message.includes("NotReadableError")) {
          errorMsg = "La cámara está siendo usada por otra aplicación. Por favor, ciérrala e intenta de nuevo.";
        } else {
          errorMsg = `Error: ${err.message}`;
        }
      }
      
      setScanError(errorMsg);
      setIsScanning(false);
      console.error("Error iniciando escáner:", err);
      
      // Limpiar el escáner si hay error
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (cleanupError) {
          console.error("Error limpiando escáner:", cleanupError);
        }
        scannerRef.current = null;
      }
    }
  };

  // Función para detener el escáner
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setScanError(null);
    } catch (err) {
      console.error("Error deteniendo escáner:", err);
    }
  };

  // Manejar código QR escaneado
  const handleQRScanned = async (scannedCode: string) => {
    const trimmedCode = scannedCode.trim();
    
    // Detener el escáner primero
    await stopScanner();
    
    // Establecer el código escaneado
    setCodigoQR(trimmedCode);
    
    // Limpiar errores previos
    setError(null);
    setSuccess(null);
    setValidacionInfo(null);
    
    // Validar automáticamente
    setIsValidating(true);
    try {
      const info = await sesionesApi.validarQR(trimmedCode);
      setValidacionInfo(info);
      
      // Si la validación es exitosa, registrar asistencia automáticamente
      setIsRegistrando(true);
      try {
        const asistencia = await asistenciasApi.registrarPorQR(trimmedCode);
        setSuccess(
          `¡Asistencia registrada exitosamente! Taller: ${asistencia.sesion?.taller?.tema || "N/A"}`
        );
        setCodigoQR("");
        setValidacionInfo(null);
      } catch (regError) {
        setError(regError instanceof Error ? regError.message : "Error al registrar asistencia");
      } finally {
        setIsRegistrando(false);
      }
    } catch (valError) {
      setError(valError instanceof Error ? valError.message : "Código QR inválido o expirado");
    } finally {
      setIsValidating(false);
    }
  };

  // Limpiar el escáner al desmontar el componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registrar Asistencia con QR</h2>
        <p className="text-muted-foreground">
          Escanea o ingresa el código QR proporcionado por el capacitador para registrar tu asistencia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Escanear Código QR
          </CardTitle>
          <CardDescription>
            Ingresa el código QR de la sesión o escanéalo con tu cámara
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botón para abrir/cerrar cámara */}
          <div className="flex justify-center">
            {!isScanning ? (
              <Button
                onClick={startScanner}
                disabled={isValidating || isRegistrando}
                variant="default"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Camera className="w-4 h-4 mr-2" />
                Abrir Cámara para Escanear
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Cerrar Cámara
              </Button>
            )}
          </div>

          {/* Contenedor del escáner */}
          {isScanning && (
            <div className="space-y-2">
              <div
                id={qrCodeRegionId}
                className="w-full rounded-lg overflow-hidden border-2 border-primary bg-black"
                style={{ 
                  minHeight: "300px",
                  maxHeight: "500px",
                  position: "relative"
                }}
              />
              {scanError && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm space-y-2">
                  <p className="font-medium">Error al acceder a la cámara</p>
                  <p>{scanError}</p>
                  <div className="mt-2 text-xs space-y-1">
                    <p><strong>Sugerencias:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Asegúrate de haber dado permiso para usar la cámara</li>
                      <li>Verifica que ninguna otra aplicación esté usando la cámara</li>
                      <li>Intenta recargar la página y volver a intentar</li>
                      <li>Si el problema persiste, puedes ingresar el código manualmente abajo</li>
                    </ul>
                  </div>
                </div>
              )}
              {!scanError && (
                <p className="text-xs text-center text-muted-foreground">
                  Apunta la cámara hacia el código QR. Asegúrate de tener buena iluminación.
                </p>
              )}
            </div>
          )}

          {/* Separador */}
          {isScanning && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="codigoQR">Código QR</Label>
            <div className="flex gap-2">
              <Input
                id="codigoQR"
                type="text"
                placeholder="Pega o escribe el código QR aquí"
                value={codigoQR}
                onChange={handleInputChange}
                onPaste={handlePaste}
                className="font-mono text-sm"
                disabled={isValidating || isRegistrando || isScanning}
              />
              <Button
                onClick={handleValidarQR}
                disabled={!codigoQR.trim() || isValidating || isRegistrando || isScanning}
                variant="outline"
              >
                {isValidating ? (
                  <>
                    <QrCode className="w-4 h-4 mr-2 animate-pulse" />
                    Validando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              También puedes pegar el código directamente (se validará automáticamente)
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-start gap-2">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-md flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">¡Éxito!</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          {validacionInfo && !success && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Código QR Válido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Taller:</span> {validacionInfo.taller?.tema || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Modalidad:</span> {validacionInfo.taller?.modalidad || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span>{" "}
                    {validacionInfo.fecha
                      ? format(new Date(validacionInfo.fecha), "PP", { locale: es })
                      : "N/A"}
                  </div>
                  {validacionInfo.horaInicio && (
                    <div>
                      <span className="font-medium">Hora:</span>{" "}
                      {format(new Date(validacionInfo.horaInicio), "HH:mm", { locale: es })}
                      {validacionInfo.horaFin &&
                        ` - ${format(new Date(validacionInfo.horaFin), "HH:mm", { locale: es })}`}
                    </div>
                  )}
                </div>
                {isRegistrando && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <QrCode className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Registrando asistencia...</p>
                    </div>
                  </div>
                )}
                {!isRegistrando && (
                  <Button
                    onClick={handleRegistrarAsistencia}
                    disabled={isRegistrando}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Registrar Asistencia
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {!validacionInfo && !error && !success && !isScanning && (
            <div className="bg-muted/50 p-6 rounded-md text-center">
              <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Ingresa o pega el código QR de la sesión para comenzar, o usa el botón de arriba para escanear con la cámara
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Instrucciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• El capacitador te proporcionará un código QR al inicio de la sesión</p>
          <p>• Puedes escanearlo con la cámara de tu dispositivo o ingresarlo manualmente</p>
          <p>• El código QR tiene un tiempo de expiración limitado</p>
          <p>• Solo puedes registrar asistencia si estás inscrito en el taller</p>
          <p>• Si el código ha expirado, solicita uno nuevo al capacitador</p>
        </CardContent>
      </Card>
    </div>
  );
}

