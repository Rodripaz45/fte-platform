// Servicio API para Inscripciones (actualizado para PARTICIPANTE)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Inscripcion {
  id: string;
  participanteId: string;
  tallerId: string;
  estado?: string;
  origen?: string;
  taller?: {
    id: string;
    tema: string;
    modalidad: string;
    cupos?: number;
    fechaInicio?: string;
    fechaFin?: string;
    sede?: string;
    estado?: string;
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

export interface CreateInscripcionDto {
  participanteId: string;
  tallerId: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const inscripcionesApi = {
  /**
   * Obtener todas las inscripciones
   */
  async getAll(): Promise<Inscripcion[]> {
    const response = await fetch(`${API_BASE_URL}/inscripciones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener inscripciones' }));
      throw new Error(error.message || 'Error al obtener inscripciones');
    }

    return response.json();
  },

  /**
   * Obtener mis inscripciones (solo para PARTICIPANTE)
   */
  async getMyInscripciones(): Promise<Inscripcion[]> {
    const response = await fetch(`${API_BASE_URL}/inscripciones/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener mis inscripciones' }));
      throw new Error(error.message || 'Error al obtener mis inscripciones');
    }

    return response.json();
  },

  /**
   * Obtener inscripciones por participanteId (filtrando del resultado completo)
   * @deprecated Usar getMyInscripciones() para PARTICIPANTE
   */
  async getByParticipanteId(participanteId: string): Promise<Inscripcion[]> {
    const all = await this.getAll();
    return all.filter(insc => insc.participanteId === participanteId);
  },

  /**
   * Obtener inscripciones por tallerId (filtrando del resultado completo)
   */
  async getByTallerId(tallerId: string): Promise<Inscripcion[]> {
    const all = await this.getAll();
    return all.filter(insc => insc.tallerId === tallerId);
  },

  /**
   * Crear una nueva inscripción
   */
  async create(dto: CreateInscripcionDto): Promise<Inscripcion> {
    const response = await fetch(`${API_BASE_URL}/inscripciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la inscripción' }));
      throw new Error(error.message || 'Error al crear la inscripción');
    }

    return response.json();
  },

  /**
   * Obtener una inscripción por ID
   */
  async getById(id: string): Promise<Inscripcion> {
    const response = await fetch(`${API_BASE_URL}/inscripciones/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la inscripción' }));
      throw new Error(error.message || 'Error al obtener la inscripción');
    }

    return response.json();
  },
};
