// Servicio API para CVs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Cv {
  id: string;
  participanteId: string;
  url: string;
  version?: string;
  texto?: string;
  subidoEn?: string;
  participante?: {
    id: string;
    usuario?: {
      id: string;
      nombre: string;
      email: string;
    };
  };
}

export interface CreateCvDto {
  participanteId: string;
  url: string;
  version?: string;
  texto?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const cvsApi = {
  /**
   * Obtener todos los CVs (opcional: filtrar por participanteId)
   */
  async getAll(participanteId?: string): Promise<Cv[]> {
    const url = participanteId
      ? `${API_BASE_URL}/cvs?participanteId=${participanteId}`
      : `${API_BASE_URL}/cvs`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener CVs' }));
      throw new Error(error.message || 'Error al obtener CVs');
    }

    return response.json();
  },

  /**
   * Obtener un CV por ID
   */
  async getById(id: string): Promise<Cv> {
    const response = await fetch(`${API_BASE_URL}/cvs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el CV' }));
      throw new Error(error.message || 'Error al obtener el CV');
    }

    return response.json();
  },

  /**
   * Crear un nuevo CV
   */
  async create(dto: CreateCvDto): Promise<Cv> {
    const response = await fetch(`${API_BASE_URL}/cvs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear el CV' }));
      throw new Error(error.message || 'Error al crear el CV');
    }

    return response.json();
  },

  /**
   * Eliminar un CV por ID
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cvs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar el CV' }));
      throw new Error(error.message || 'Error al eliminar el CV');
    }
  },
};

