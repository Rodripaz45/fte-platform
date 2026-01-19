// Servicio API para Recursos (Salas y Reservas)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Sala {
  id: string;
  nombre: string;
  sede: string;
  capacidad: number;
  equipamiento?: string;
  descripcion?: string;
  activa: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
  _count?: {
    sesiones: number;
    reservas: number;
  };
}

export interface ReservaSala {
  id: string;
  salaId: string;
  sesionId?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'RESERVADA' | 'CONFIRMADA' | 'CANCELADA';
  motivo?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  sala?: Sala;
  sesion?: {
    id: string;
    taller?: {
      tema: string;
      trainer?: {
        nombre: string;
      };
    };
  };
}

export interface CreateSalaDto {
  nombre: string;
  sede: string;
  capacidad: number;
  equipamiento?: string;
  descripcion?: string;
  activa?: boolean;
}

export interface UpdateSalaDto {
  nombre?: string;
  sede?: string;
  capacidad?: number;
  equipamiento?: string;
  descripcion?: string;
  activa?: boolean;
}

export interface CreateReservaSalaDto {
  salaId: string;
  sesionId?: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: 'RESERVADA' | 'CONFIRMADA' | 'CANCELADA';
  motivo?: string;
}

export interface UpdateReservaSalaDto {
  salaId?: string;
  sesionId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'RESERVADA' | 'CONFIRMADA' | 'CANCELADA';
  motivo?: string;
}

export interface VerificarDisponibilidadDto {
  salaId: string;
  fechaInicio: string;
  fechaFin: string;
  reservaId?: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  conflictos: Array<{
    id: string;
    fechaInicio: string;
    fechaFin: string;
    sesion?: {
      id: string;
      taller: string;
      trainer: string;
    };
    motivo?: string;
  }>;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const recursosApi = {
  // ========== SALAS ==========

  async getAllSalas(sede?: string, activa?: boolean): Promise<Sala[]> {
    const queryParams = new URLSearchParams();
    if (sede) queryParams.append('sede', sede);
    if (activa !== undefined) queryParams.append('activa', activa.toString());

    const url = `${API_BASE_URL}/recursos/salas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener salas' }));
      throw new Error(error.message || 'Error al obtener salas');
    }

    return response.json();
  },

  async getSalaById(id: string): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/recursos/salas/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la sala' }));
      throw new Error(error.message || 'Error al obtener la sala');
    }

    return response.json();
  },

  async createSala(dto: CreateSalaDto): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/recursos/salas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la sala' }));
      throw new Error(error.message || 'Error al crear la sala');
    }

    return response.json();
  },

  async updateSala(id: string, dto: UpdateSalaDto): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/recursos/salas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la sala' }));
      throw new Error(error.message || 'Error al actualizar la sala');
    }

    return response.json();
  },

  async deleteSala(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/recursos/salas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la sala' }));
      throw new Error(error.message || 'Error al eliminar la sala');
    }
  },

  // ========== RESERVAS ==========

  async verificarDisponibilidad(dto: VerificarDisponibilidadDto): Promise<DisponibilidadResponse> {
    const response = await fetch(`${API_BASE_URL}/recursos/reservas/verificar-disponibilidad`, {
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

  async getAllReservas(salaId?: string, fechaInicio?: string, fechaFin?: string): Promise<ReservaSala[]> {
    const queryParams = new URLSearchParams();
    if (salaId) queryParams.append('salaId', salaId);
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/recursos/reservas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener reservas' }));
      throw new Error(error.message || 'Error al obtener reservas');
    }

    return response.json();
  },

  async getReservaById(id: string): Promise<ReservaSala> {
    const response = await fetch(`${API_BASE_URL}/recursos/reservas/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la reserva' }));
      throw new Error(error.message || 'Error al obtener la reserva');
    }

    return response.json();
  },

  async createReserva(dto: CreateReservaSalaDto): Promise<ReservaSala> {
    const response = await fetch(`${API_BASE_URL}/recursos/reservas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la reserva' }));
      throw new Error(error.message || 'Error al crear la reserva');
    }

    return response.json();
  },

  async updateReserva(id: string, dto: UpdateReservaSalaDto): Promise<ReservaSala> {
    const response = await fetch(`${API_BASE_URL}/recursos/reservas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la reserva' }));
      throw new Error(error.message || 'Error al actualizar la reserva');
    }

    return response.json();
  },

  async deleteReserva(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/recursos/reservas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la reserva' }));
      throw new Error(error.message || 'Error al eliminar la reserva');
    }
  },
};

