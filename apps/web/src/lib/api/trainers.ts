// Servicio API para gestionar trainers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Trainer {
  id: string;
  nombre: string;
  email: string;
  estado: string | null;
  creadoEn: string;
  actualizadoEn: string;
  roles: Array<{
    id: number;
    nombre: string;
  }>;
}

export interface CreateTrainerDto {
  nombre: string;
  email: string;
  password: string;
  estado?: string;
}

export interface UpdateTrainerDto {
  nombre?: string;
  email?: string;
  password?: string;
  estado?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const trainersApi = {
  /**
   * Obtener todos los trainers
   */
  async getAll(): Promise<Trainer[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios/trainers/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener trainers' }));
      throw new Error(error.message || 'Error al obtener trainers');
    }

    return response.json();
  },

  /**
   * Crear un nuevo trainer
   */
  async create(dto: CreateTrainerDto): Promise<Trainer> {
    const response = await fetch(`${API_BASE_URL}/usuarios/trainers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear trainer' }));
      throw new Error(error.message || 'Error al crear trainer');
    }

    return response.json();
  },

  /**
   * Actualizar un trainer
   */
  async update(id: string, dto: UpdateTrainerDto): Promise<Trainer> {
    const response = await fetch(`${API_BASE_URL}/usuarios/trainers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar trainer' }));
      throw new Error(error.message || 'Error al actualizar trainer');
    }

    return response.json();
  },

  /**
   * Desactivar un trainer
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/usuarios/trainers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al desactivar trainer' }));
      throw new Error(error.message || 'Error al desactivar trainer');
    }
  },
};

