// Servicio API para Competencias
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Competencia {
  competencia: string;
  nivel: number;
  confianza: number;
  fuente?: string;
  actualizadoEn?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const competenciasApi = {
  /**
   * Obtener competencias de un participante
   */
  async getByParticipanteId(participanteId: string): Promise<Competencia[]> {
    const response = await fetch(`${API_BASE_URL}/ia/competencias/${participanteId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener competencias' }));
      throw new Error(error.message || 'Error al obtener competencias');
    }

    return response.json();
  },
};

