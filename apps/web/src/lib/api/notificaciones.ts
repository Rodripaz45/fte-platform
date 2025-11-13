// Servicio API para Notificaciones
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  LEIDA = 'LEIDA',
  FALLIDA = 'FALLIDA',
}

export enum TipoNotificacion {
  RECORDATORIO_SESION = 'RECORDATORIO_SESION',
  CONFIRMACION_INSCRIPCION = 'CONFIRMACION_INSCRIPCION',
  NUEVO_TALLER = 'NUEVO_TALLER',
  RECORDATORIO_ENCUESTA = 'RECORDATORIO_ENCUESTA',
  ASISTENCIA_REGISTRADA = 'ASISTENCIA_REGISTRADA',
  TALLER_CANCELADO = 'TALLER_CANCELADO',
  TALLER_MODIFICADO = 'TALLER_MODIFICADO',
  OTRO = 'OTRO',
}

export enum CanalNotificacion {
  EMAIL = 'EMAIL',
  WEB = 'WEB',
  SMS = 'SMS',
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  canal?: CanalNotificacion;
  tipo?: TipoNotificacion;
  estado?: EstadoNotificacion;
  titulo?: string;
  mensaje?: string;
  creadoEn: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CreateNotificacionDto {
  usuarioId: string;
  canal?: CanalNotificacion;
  tipo?: TipoNotificacion;
  estado?: EstadoNotificacion;
  titulo?: string;
  mensaje?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const notificacionesApi = {
  /**
   * Obtener mis notificaciones
   */
  async getMisNotificaciones(options?: { soloNoLeidas?: boolean; limit?: number }): Promise<Notificacion[]> {
    const params = new URLSearchParams();
    if (options?.soloNoLeidas) params.append('soloNoLeidas', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(`${API_BASE_URL}/notificaciones/me?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener notificaciones' }));
      throw new Error(error.message || 'Error al obtener notificaciones');
    }

    return response.json();
  },

  /**
   * Contar notificaciones no leídas
   */
  async countNoLeidas(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/notificaciones/me/count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al contar notificaciones' }));
      throw new Error(error.message || 'Error al contar notificaciones');
    }

    const data = await response.json();
    return data.count || 0;
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notificaciones/me/marcar-todas-leidas`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al marcar notificaciones' }));
      throw new Error(error.message || 'Error al marcar notificaciones');
    }
  },

  /**
   * Obtener una notificación por ID
   */
  async getById(id: string): Promise<Notificacion> {
    const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener notificación' }));
      throw new Error(error.message || 'Error al obtener notificación');
    }

    return response.json();
  },

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(id: string): Promise<Notificacion> {
    const response = await fetch(`${API_BASE_URL}/notificaciones/${id}/leida`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al marcar notificación' }));
      throw new Error(error.message || 'Error al marcar notificación');
    }

    return response.json();
  },

  /**
   * Eliminar una notificación
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar notificación' }));
      throw new Error(error.message || 'Error al eliminar notificación');
    }
  },

  /**
   * Crear una notificación (solo ADMIN)
   */
  async create(dto: CreateNotificacionDto): Promise<Notificacion> {
    const response = await fetch(`${API_BASE_URL}/notificaciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear notificación' }));
      throw new Error(error.message || 'Error al crear notificación');
    }

    return response.json();
  },
};

