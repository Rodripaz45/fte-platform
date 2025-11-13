// Servicio API para Talleres
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Taller {
  id: string;
  tema: string;
  modalidad: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  // Campos adicionales para información de cupos
  cuposDisponibles?: number | null;
  cuposOcupados?: number;
  tieneCuposLimitados?: boolean;
}

export interface CreateTallerDto {
  tema: string;
  modalidad: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
}

export interface UpdateTallerDto {
  tema?: string;
  modalidad?: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const talleresApi = {
  /**
   * Obtener todos los talleres
   */
  async getAll(): Promise<Taller[]> {
    const response = await fetch(`${API_BASE_URL}/talleres`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener talleres' }));
      throw new Error(error.message || 'Error al obtener talleres');
    }

    return response.json();
  },

  /**
   * Obtener un taller por ID
   */
  async getById(id: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el taller' }));
      throw new Error(error.message || 'Error al obtener el taller');
    }

    return response.json();
  },

  /**
   * Crear un nuevo taller
   */
  async create(dto: CreateTallerDto): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear el taller' }));
      throw new Error(error.message || 'Error al crear el taller');
    }

    return response.json();
  },

  /**
   * Actualizar un taller
   */
  async update(id: string, dto: UpdateTallerDto): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar el taller' }));
      throw new Error(error.message || 'Error al actualizar el taller');
    }

    return response.json();
  },

  /**
   * Eliminar un taller
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar el taller' }));
      throw new Error(error.message || 'Error al eliminar el taller');
    }
  },
};
