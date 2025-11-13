"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, RefreshCw, X, Download, Clock } from "lucide-react";
import { sesionesApi, type GenerarQRResponse } from "@/lib/api/sesiones";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface QRCodeModalProps {
  sesionId: string;
  sesionTema?: string;
  open: boolean;
  onClose: () => void;
  onQRGenerated?: () => void;
}

export default function QRCodeModal({
  sesionId,
  sesionTema,
  open,
  onClose,
  onQRGenerated,
}: QRCodeModalProps) {
  const [qrData, setQrData] = useState<GenerarQRResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (open && sesionId) {
      generarQR();
    } else {
      setQrData(null);
      setError(null);
    }
  }, [open, sesionId]);

  useEffect(() => {
    if (qrData?.expiracion) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiracion = new Date(qrData.expiracion).getTime();
        const remaining = Math.max(0, Math.floor((expiracion - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrData]);

  const generarQR = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await sesionesApi.generarQR(sesionId, duracionMinutos);
      setQrData(data);
      if (onQRGenerated) {
        onQRGenerated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar código QR");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerarQR = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const data = await sesionesApi.regenerarQR(sesionId, duracionMinutos);
      setQrData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al regenerar código QR");
    } finally {
      setIsRegenerating(false);
    }
  };

  const invalidarQR = async () => {
    try {
      await sesionesApi.invalidarQR(sesionId);
      setQrData(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al invalidar código QR");
    }
  };

  const descargarQR = () => {
    if (!qrData?.qrImage) return;

    const link = document.createElement("a");
    link.href = qrData.qrImage;
    link.download = `qr-sesion-${sesionId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Tamaño fijo del contenedor del QR (más pequeño, no ocupa toda la pantalla)
  const qrContainerHeight = "h-[240px] sm:h-[320px]";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        {/* Header con botón de cerrar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Código QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error si existe */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {/* Contenedor del QR */}
        <div className="mb-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Generando código QR...</p>
            </div>
          ) : qrData ? (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={qrData.qrImage}
                  alt="Código QR"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  Expira: {format(new Date(qrData.expiracion), "HH:mm", { locale: es })}
                </span>
              </div>
              {timeRemaining !== null && timeRemaining === 0 && (
                <div className="mt-3 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md text-sm">
                  ⚠️ El código QR ha expirado. Cierra y genera uno nuevo.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
