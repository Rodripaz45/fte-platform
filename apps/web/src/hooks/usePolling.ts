import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number; // en milisegundos
  pauseWhenHidden?: boolean; // pausar cuando la pestaña no está visible
}

/**
 * Hook para realizar polling de una función
 * @param callback Función a ejecutar periódicamente
 * @param options Opciones de configuración
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 segundos por defecto
    pauseWhenHidden = true,
  } = options;

  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Actualizar la referencia del callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Manejar visibilidad de la pestaña
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (document.hidden) {
        // Pausar cuando se oculta
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (enabled) {
        // Reanudar cuando se vuelve visible
        // Ejecutar inmediatamente y luego continuar con el intervalo
        callbackRef.current();
        intervalRef.current = setInterval(() => {
          callbackRef.current();
        }, interval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, pauseWhenHidden]);

  // Configurar el polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ejecutar inmediatamente la primera vez
    callbackRef.current();

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        callbackRef.current();
      }
    }, interval);

    // Limpiar al desmontar o cuando cambien las dependencias
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);

  // Función para detener manualmente el polling
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Función para iniciar manualmente el polling
  const start = () => {
    if (!intervalRef.current && enabled) {
      callbackRef.current();
      intervalRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          callbackRef.current();
        }
      }, interval);
    }
  };

  return { stop, start };
}

