// Servicio API para Certificados
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Certificado {
  id: string;
  tallerId: string;
  participanteId: string;
  codigo: string;
  urlPDF?: string | null;
  emitidoEn: string;
  emitidoPor?: string | null;
  enviadoPorEmail: boolean;
  fechaEnvio?: string | null;
  participante?: {
    id: string;
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
  };
  taller?: {
    id: string;
    tema: string;
    modalidad: string;
    fechaInicio?: string | null;
    fechaFin?: string | null;
  };
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const certificadosApi = {
  /**
   * Obtener mis certificados (para participantes)
   */
  async getMisCertificados(): Promise<Certificado[]> {
    const response = await fetch(`${API_BASE_URL}/certificados/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener certificados' }));
      throw new Error(error.message || 'Error al obtener certificados');
    }

    return response.json();
  },

  /**
   * Obtener un certificado por ID
   */
  async getById(id: string): Promise<Certificado> {
    const response = await fetch(`${API_BASE_URL}/certificados/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el certificado' }));
      throw new Error(error.message || 'Error al obtener el certificado');
    }

    return response.json();
  },

  /**
   * Verificar un certificado por código (público)
   */
  async verificarPorCodigo(codigo: string): Promise<Certificado> {
    const response = await fetch(`${API_BASE_URL}/certificados/verificar/${codigo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Certificado no encontrado' }));
      throw new Error(error.message || 'Certificado no encontrado');
    }

    return response.json();
  },

  /**
   * Reenviar certificado por email
   */
  async reenviarPorEmail(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/certificados/${id}/reenviar-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al reenviar el certificado' }));
      throw new Error(error.message || 'Error al reenviar el certificado');
    }
  },

  /**
   * Emitir certificado manualmente (para admins/trainers)
   */
  async emitir(tallerId: string, participanteId: string): Promise<Certificado> {
    const response = await fetch(`${API_BASE_URL}/certificados/emitir/${tallerId}/${participanteId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al emitir el certificado' }));
      throw new Error(error.message || 'Error al emitir el certificado');
    }

    return response.json();
  },

  /**
   * Emitir certificados masivamente para un taller (para admins/trainers)
   */
  async emitirMasivo(tallerId: string): Promise<{
    total: number;
    emitidos: number;
    noElegibles: number;
    errores: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/certificados/emitir-masivo/${tallerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al emitir certificados' }));
      throw new Error(error.message || 'Error al emitir certificados');
    }

    return response.json();
  },

  /**
   * Obtener todos los certificados (solo admin)
   */
  async getAll(): Promise<Certificado[]> {
    const response = await fetch(`${API_BASE_URL}/certificados/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener certificados' }));
      throw new Error(error.message || 'Error al obtener certificados');
    }

    return response.json();
  },

  /**
   * Regenerar y reenviar certificado (solo admin, permite regenerar aunque ya exista)
   */
  async regenerar(id: string): Promise<Certificado> {
    const response = await fetch(`${API_BASE_URL}/certificados/${id}/regenerar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al regenerar el certificado' }));
      throw new Error(error.message || 'Error al regenerar el certificado');
    }

    const data = await response.json();
    return data.certificado;
  },
};

