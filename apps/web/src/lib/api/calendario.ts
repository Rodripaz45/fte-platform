// Servicio API para Calendario
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface EventoCalendario {
  id: string;
  tipo: 'TALLER' | 'SESION' | 'BLOQUEO' | 'FERIADO';
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  color: string;
  estado?: string;
  trainer?: {
    id: string;
    nombre: string;
    email: string;
  };
  sede?: string;
  modalidad?: string;
  cupos?: number;
  inscripciones?: number;
  sesiones?: number;
  unidadEducativa?: {
    id: string;
    nombre: string;
  };
  taller?: {
    id: string;
    tema: string;
    modalidad: string;
    trainer?: {
      id: string;
      nombre: string;
    };
  };
  responsable?: {
    id: string;
    nombre: string;
    email: string;
  };
  sala?: {
    id: string;
    nombre: string;
    sede: string;
  };
  fecha?: string;
  motivo?: string;
}

export interface FiltrosCalendario {
  fechaInicio?: string;
  fechaFin?: string;
  trainerId?: string;
  sede?: string;
  modalidad?: string;
  estado?: string;
  tiposEvento?: ('TALLER' | 'SESION' | 'BLOQUEO' | 'FERIADO')[];
}

export interface EventosCalendarioResponse {
  eventos: EventoCalendario[];
  total: number;
  filtros: FiltrosCalendario;
}

export interface ConflictoCalendario {
  tipo: 'TRAINER_CONFLICTO' | 'SALA_CONFLICTO';
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
  descripcion: string;
  trainer?: {
    id: string;
    nombre: string;
  };
  sala?: {
    id: string;
    nombre: string;
    sede: string;
  };
  sesiones?: Array<{
    id: string;
    fecha: string;
    horaInicio?: string;
    horaFin?: string;
    taller: string;
  }>;
  reservas?: Array<{
    id: string;
    fechaInicio: string;
    fechaFin: string;
    sesion?: {
      id: string;
      taller: string;
    };
    motivo?: string;
  }>;
}

export interface ConflictosCalendarioResponse {
  conflictos: ConflictoCalendario[];
  total: number;
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const calendarioApi = {
  async obtenerEventos(filtros?: FiltrosCalendario): Promise<EventosCalendarioResponse> {
    const queryParams = new URLSearchParams();
    if (filtros?.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
    if (filtros?.trainerId) queryParams.append('trainerId', filtros.trainerId);
    if (filtros?.sede) queryParams.append('sede', filtros.sede);
    if (filtros?.modalidad) queryParams.append('modalidad', filtros.modalidad);
    if (filtros?.estado) queryParams.append('estado', filtros.estado);
    if (filtros?.tiposEvento) {
      filtros.tiposEvento.forEach(tipo => queryParams.append('tiposEvento', tipo));
    }

    const url = `${API_BASE_URL}/calendario/eventos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener eventos' }));
      throw new Error(error.message || 'Error al obtener eventos');
    }

    return response.json();
  },

  async detectarConflictos(fechaInicio?: string, fechaFin?: string): Promise<ConflictosCalendarioResponse> {
    const queryParams = new URLSearchParams();
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/calendario/conflictos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al detectar conflictos' }));
      throw new Error(error.message || 'Error al detectar conflictos');
    }

    return response.json();
  },
};

