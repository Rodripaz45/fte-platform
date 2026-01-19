// Servicio API para Disponibilidad de Trainers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface DisponibilidadTrainer {
  id: string;
  trainerId: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: 'DISPONIBLE' | 'NO_DISPONIBLE' | 'OCUPADO';
  motivo?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  trainer?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CreateDisponibilidadDto {
  trainerId: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: 'DISPONIBLE' | 'NO_DISPONIBLE' | 'OCUPADO';
  motivo?: string;
}

export interface UpdateDisponibilidadDto {
  trainerId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: 'DISPONIBLE' | 'NO_DISPONIBLE' | 'OCUPADO';
  motivo?: string;
}

export interface VerificarDisponibilidadTrainerDto {
  trainerId: string;
  fechaInicio: string;
  fechaFin: string;
  disponibilidadId?: string;
}

export interface VerificacionDisponibilidadResponse {
  disponible: boolean;
  conflictosDisponibilidad: Array<{
    id: string;
    fechaInicio: string;
    fechaFin: string;
    tipo: string;
    motivo?: string;
  }>;
  conflictosSesiones: Array<{
    id: string;
    fecha: string;
    horaInicio?: string;
    horaFin?: string;
    taller: string;
  }>;
}

export interface CargaTrabajoResponse {
  trainer: {
    id: string;
    nombre: string;
    email: string;
  };
  periodo: {
    fechaInicio: string | null;
    fechaFin: string | null;
  };
  estadisticas: {
    totalSesiones: number;
    totalTalleres: number;
    diasNoDisponibles: number;
  };
}

export interface SugerirTrainersResponse {
  fechaInicio: string;
  fechaFin: string;
  trainers: Array<{
    trainer: {
      id: string;
      nombre: string;
      email: string;
    };
    disponible: boolean;
    cargaTrabajo?: {
      totalSesiones: number;
      totalTalleres: number;
      diasNoDisponibles: number;
    };
    conflictos?: VerificacionDisponibilidadResponse;
  }>;
  disponibles: number;
  noDisponibles: number;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const disponibilidadApi = {
  async verificarDisponibilidad(dto: VerificarDisponibilidadTrainerDto): Promise<VerificacionDisponibilidadResponse> {
    const response = await fetch(`${API_BASE_URL}/disponibilidad/verificar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al verificar disponibilidad' }));
      throw new Error(error.message || 'Error al verificar disponibilidad');
    }

    return response.json();
  },

  async getAll(trainerId?: string, fechaInicio?: string, fechaFin?: string): Promise<DisponibilidadTrainer[]> {
    const queryParams = new URLSearchParams();
    if (trainerId) queryParams.append('trainerId', trainerId);
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/disponibilidad${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener disponibilidades' }));
      throw new Error(error.message || 'Error al obtener disponibilidades');
    }

    return response.json();
  },

  async getById(id: string): Promise<DisponibilidadTrainer> {
    const response = await fetch(`${API_BASE_URL}/disponibilidad/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la disponibilidad' }));
      throw new Error(error.message || 'Error al obtener la disponibilidad');
    }

    return response.json();
  },

  async create(dto: CreateDisponibilidadDto): Promise<DisponibilidadTrainer> {
    const response = await fetch(`${API_BASE_URL}/disponibilidad`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la disponibilidad' }));
      throw new Error(error.message || 'Error al crear la disponibilidad');
    }

    return response.json();
  },

  async update(id: string, dto: UpdateDisponibilidadDto): Promise<DisponibilidadTrainer> {
    const response = await fetch(`${API_BASE_URL}/disponibilidad/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la disponibilidad' }));
      throw new Error(error.message || 'Error al actualizar la disponibilidad');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/disponibilidad/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la disponibilidad' }));
      throw new Error(error.message || 'Error al eliminar la disponibilidad');
    }
  },

  async obtenerCargaTrabajo(trainerId: string, fechaInicio?: string, fechaFin?: string): Promise<CargaTrabajoResponse> {
    const queryParams = new URLSearchParams();
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/disponibilidad/trainers/${trainerId}/carga-trabajo${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener carga de trabajo' }));
      throw new Error(error.message || 'Error al obtener carga de trabajo');
    }

    return response.json();
  },

  async sugerirTrainersDisponibles(fechaInicio: string, fechaFin: string): Promise<SugerirTrainersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('fechaInicio', fechaInicio);
    queryParams.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/disponibilidad/sugerir-trainers?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al sugerir trainers' }));
      throw new Error(error.message || 'Error al sugerir trainers');
    }

    return response.json();
  },
};

