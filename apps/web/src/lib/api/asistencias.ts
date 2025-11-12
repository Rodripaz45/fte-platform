// Servicio API para Asistencias
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Asistencia {
  id: string;
  sesionId: string;
  participanteId: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
  sesion?: {
    id: string;
    fecha: string;
    taller?: {
      id: string;
      tema: string;
    };
  };
  participante?: {
    id: string;
    usuario?: {
      id: string;
      nombre: string;
      email: string;
    };
  };
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ItemAsistenciaDto {
  participanteId: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
}

export interface TomarAsistenciaDto {
  sesionId: string;
  items: ItemAsistenciaDto[];
}

export interface CreateAsistenciaDto {
  sesionId: string;
  participanteId: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
}

export interface UpdateAsistenciaDto {
  estado?: 'PRESENTE' | 'AUSENTE' | 'TARDE';
}

export interface AsistenciaResumen {
  sesionId: string;
  total: number;
  presentes: number;
  ausentes: number;
  tardes: number;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const asistenciasApi = {
  /**
   * Obtener todas las asistencias (opcional: filtrar por sesionId)
   */
  async getAll(sesionId?: string): Promise<Asistencia[]> {
    const url = sesionId
      ? `${API_BASE_URL}/asistencias?sesionId=${sesionId}`
      : `${API_BASE_URL}/asistencias`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener asistencias' }));
      throw new Error(error.message || 'Error al obtener asistencias');
    }

    return response.json();
  },

  /**
   * Obtener una asistencia por ID
   */
  async getById(id: string): Promise<Asistencia> {
    const response = await fetch(`${API_BASE_URL}/asistencias/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la asistencia' }));
      throw new Error(error.message || 'Error al obtener la asistencia');
    }

    return response.json();
  },

  /**
   * Tomar asistencia masiva
   */
  async tomar(dto: TomarAsistenciaDto): Promise<Asistencia[]> {
    const response = await fetch(`${API_BASE_URL}/asistencias/tomar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al tomar asistencia' }));
      throw new Error(error.message || 'Error al tomar asistencia');
    }

    return response.json();
  },

  /**
   * Crear una asistencia individual
   */
  async create(dto: CreateAsistenciaDto): Promise<Asistencia> {
    const response = await fetch(`${API_BASE_URL}/asistencias`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la asistencia' }));
      throw new Error(error.message || 'Error al crear la asistencia');
    }

    return response.json();
  },

  /**
   * Actualizar una asistencia
   */
  async update(id: string, dto: UpdateAsistenciaDto): Promise<Asistencia> {
    const response = await fetch(`${API_BASE_URL}/asistencias/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la asistencia' }));
      throw new Error(error.message || 'Error al actualizar la asistencia');
    }

    return response.json();
  },

  /**
   * Eliminar una asistencia
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/asistencias/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la asistencia' }));
      throw new Error(error.message || 'Error al eliminar la asistencia');
    }
  },

  /**
   * Obtener resumen de asistencia por sesión
   */
  async getResumen(sesionId: string): Promise<AsistenciaResumen> {
    const response = await fetch(`${API_BASE_URL}/asistencias/resumen?sesionId=${sesionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el resumen' }));
      throw new Error(error.message || 'Error al obtener el resumen');
    }

    return response.json();
  },
};

