// Servicio API para Participantes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Participante {
  id: string;
  usuarioId: string;
  documento?: string;
  telefono?: string;
  genero?: string;
  fechaNac?: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    roles: string[];
  };
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CreateParticipanteDto {
  documento?: string;
  telefono?: string;
  genero?: string;
  fechaNac?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const participantesApi = {
  /**
   * Obtener todos los participantes (solo para ADMIN y TRAINER)
   */
  async getAll(): Promise<Participante[]> {
    const response = await fetch(`${API_BASE_URL}/participantes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener participantes' }));
      throw new Error(error.message || 'Error al obtener participantes');
    }

    return response.json();
  },

  /**
   * Obtener un participante por ID (solo para ADMIN y TRAINER)
   */
  async getById(id: string): Promise<Participante> {
    const response = await fetch(`${API_BASE_URL}/participantes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener participante' }));
      throw new Error(error.message || 'Error al obtener participante');
    }

    return response.json();
  },

  /**
   * Crear mi perfil de participante (solo para PARTICIPANTE)
   */
  async createMyProfile(dto: CreateParticipanteDto): Promise<Participante> {
    const response = await fetch(`${API_BASE_URL}/participantes/me`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear el perfil' }));
      throw new Error(error.message || 'Error al crear el perfil');
    }

    return response.json();
  },
};
