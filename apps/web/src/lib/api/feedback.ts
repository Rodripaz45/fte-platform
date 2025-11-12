// Servicio API para Feedback (actualizado para PARTICIPANTE)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Feedback {
  id: string;
  tallerId: string;
  participanteId: string;
  puntaje: number;
  comentario?: string;
  taller?: {
    id: string;
    tema: string;
    modalidad: string;
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

export interface CreateFeedbackDto {
  tallerId: string;
  participanteId: string;
  puntaje: number;
  comentario?: string;
}

export interface FeedbackResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Feedback[];
}

export interface FeedbackResumen {
  tallerId: string;
  total: number;
  promedio: number;
  distribucion: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const feedbackApi = {
  /**
   * Crear un nuevo feedback
   */
  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear el feedback' }));
      throw new Error(error.message || 'Error al crear el feedback');
    }

    return response.json();
  },

  /**
   * Obtener todos los feedbacks (con filtros opcionales)
   */
  async getAll(params?: {
    tallerId?: string;
    participanteId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<FeedbackResponse> {
    const queryParams = new URLSearchParams();
    if (params?.tallerId) queryParams.append('tallerId', params.tallerId);
    if (params?.participanteId) queryParams.append('participanteId', params.participanteId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${API_BASE_URL}/feedback${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener feedback' }));
      throw new Error(error.message || 'Error al obtener feedback');
    }

    return response.json();
  },

  /**
   * Obtener un feedback por ID
   */
  async getById(id: string): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el feedback' }));
      throw new Error(error.message || 'Error al obtener el feedback');
    }

    return response.json();
  },

  /**
   * Obtener resumen de feedback por taller
   */
  async getResumen(tallerId: string): Promise<FeedbackResumen> {
    const response = await fetch(`${API_BASE_URL}/feedback/resumen/${tallerId}`, {
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
