"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notificacionesApi } from "@/lib/api/notificaciones";
import { usePolling } from "@/hooks/usePolling";
import { useRouter } from "next/navigation";

export default function NotificacionesBadge() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadCount();
  }, []);

  // Polling cada 15 segundos para actualizar el contador
  usePolling(() => {
    loadCount();
  }, { interval: 15000, pauseWhenDialogOpen: true });

  const loadCount = async () => {
    try {
      const countNoLeidas = await notificacionesApi.countNoLeidas();
      setCount(countNoLeidas);
    } catch (err) {
      console.error('Error contando notificaciones:', err);
      setCount(0);
    }
  };

  const handleClick = () => {
    // Scroll a la sección de notificaciones o mostrar mensaje
    const notifTab = document.querySelector('[value="notificaciones"]') as HTMLElement;
    if (notifTab) {
      notifTab.click();
      notifTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      title={count > 0 ? `${count} notificación${count > 1 ? 'es' : ''} no leída${count > 1 ? 's' : ''}` : 'Notificaciones'}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Button>
  );
}

