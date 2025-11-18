// Servicio API para Reportes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  modalidad?: string;
  tallerId?: string;
  participanteId?: string;
}

export interface DashboardEjecutivo {
  resumen: {
    promedioAsistencia: number;
    promedioSatisfaccion: number;
    tasaRecurrencia: number;
    cobertura: number;
  };
  asistencia: TasaAsistencia[];
  satisfaccion: SatisfaccionPorTaller[];
  recurrencia: TasaRecurrencia;
  cobertura: Cobertura;
  filtros: FiltrosReporte;
}

export interface TasaAsistencia {
  tallerId: string;
  tema: string;
  modalidad: string;
  totalInscripciones: number;
  totalSesiones: number;
  totalAsistencias: number;
  tasaAsistencia: number;
}

export interface SatisfaccionPorTaller {
  tallerId: string;
  tema: string;
  modalidad: string;
  totalFeedbacks: number;
  promedioSatisfaccion: number;
  distribucion: Array<{ puntaje: number; cantidad: number }>;
}

export interface TasaRecurrencia {
  totalParticipantes: number;
  participantesRecurrentes: number;
  participantesUnicos: number;
  tasaRecurrencia: number;
}

export interface Cobertura {
  participantesUnicos: number;
}

export const reportesApi = {
  /**
   * Obtener dashboard ejecutivo con todos los KPIs
   */
  async getDashboardEjecutivo(filtros?: FiltrosReporte): Promise<DashboardEjecutivo> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros?.tallerId) params.append('tallerId', filtros.tallerId);
    if (filtros?.participanteId) params.append('participanteId', filtros.participanteId);

    const response = await fetch(`${API_BASE_URL}/reportes/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener dashboard' }));
      throw new Error(error.message || 'Error al obtener dashboard');
    }

    return response.json();
  },

  /**
   * Obtener tasa de asistencia por taller
   */
  async getTasaAsistencia(filtros?: FiltrosReporte): Promise<TasaAsistencia[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros?.tallerId) params.append('tallerId', filtros.tallerId);

    const response = await fetch(`${API_BASE_URL}/reportes/asistencia?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener tasa de asistencia' }));
      throw new Error(error.message || 'Error al obtener tasa de asistencia');
    }

    return response.json();
  },

  /**
   * Obtener satisfacción por taller
   */
  async getSatisfaccion(filtros?: FiltrosReporte): Promise<SatisfaccionPorTaller[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros?.tallerId) params.append('tallerId', filtros.tallerId);

    const response = await fetch(`${API_BASE_URL}/reportes/satisfaccion?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener satisfacción' }));
      throw new Error(error.message || 'Error al obtener satisfacción');
    }

    return response.json();
  },

  /**
   * Obtener tasa de recurrencia
   */
  async getRecurrencia(filtros?: FiltrosReporte): Promise<TasaRecurrencia> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);

    const response = await fetch(`${API_BASE_URL}/reportes/recurrencia?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener recurrencia' }));
      throw new Error(error.message || 'Error al obtener recurrencia');
    }

    return response.json();
  },

  /**
   * Obtener cobertura (participantes únicos)
   */
  async getCobertura(filtros?: FiltrosReporte): Promise<Cobertura> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);

    const response = await fetch(`${API_BASE_URL}/reportes/cobertura?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener cobertura' }));
      throw new Error(error.message || 'Error al obtener cobertura');
    }

    return response.json();
  },

  /**
   * Exportar reporte a PDF
   */
  async exportarPDF(
    tipo: 'dashboard' | 'inscripciones' | 'asistencia' | 'satisfaccion',
    filtros?: FiltrosReporte,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('tipo', tipo);
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros?.tallerId) params.append('tallerId', filtros.tallerId);
    if (filtros?.participanteId) params.append('participanteId', filtros.participanteId);

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/reportes/exportar/pdf?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al exportar reporte PDF' }));
      throw new Error(error.message || 'Error al exportar reporte PDF');
    }

    return response.blob();
  },
};

