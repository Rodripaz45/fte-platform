// Servicio API para Unidades Educativas
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UnidadEducativa {
  id: string;
  nombre: string;
  codigo?: string;
  direccion?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  _count?: {
    talleres?: number;
    listasParticipantes?: number;
  };
}

export interface CreateUnidadEducativaDto {
  nombre: string;
  codigo?: string;
  direccion?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
}

export interface UpdateUnidadEducativaDto {
  nombre?: string;
  codigo?: string;
  direccion?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const unidadesEducativasApi = {
  async getAll(): Promise<UnidadEducativa[]> {
    const response = await fetch(`${API_BASE_URL}/unidades-educativas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener unidades educativas' }));
      throw new Error(error.message || 'Error al obtener unidades educativas');
    }

    return response.json();
  },

  async getById(id: string): Promise<UnidadEducativa> {
    const response = await fetch(`${API_BASE_URL}/unidades-educativas/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la unidad educativa' }));
      throw new Error(error.message || 'Error al obtener la unidad educativa');
    }

    return response.json();
  },

  async create(dto: CreateUnidadEducativaDto): Promise<UnidadEducativa> {
    const response = await fetch(`${API_BASE_URL}/unidades-educativas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la unidad educativa' }));
      throw new Error(error.message || 'Error al crear la unidad educativa');
    }

    return response.json();
  },

  async update(id: string, dto: UpdateUnidadEducativaDto): Promise<UnidadEducativa> {
    const response = await fetch(`${API_BASE_URL}/unidades-educativas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la unidad educativa' }));
      throw new Error(error.message || 'Error al actualizar la unidad educativa');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/unidades-educativas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la unidad educativa' }));
      throw new Error(error.message || 'Error al eliminar la unidad educativa');
    }
  },
};

