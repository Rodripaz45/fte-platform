// Servicio API para Importaciones
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ParticipanteImportado {
  nombre: string;
  documento?: string;
  email?: string;
  telefono?: string;
  genero?: string;
  fechaNac?: string;
}

export interface ImportarListaDto {
  tallerId: string;
  participantes: ParticipanteImportado[];
}

export interface ResultadoImportacion {
  total: number;
  creados: number;
  duplicados: number;
  errores: Array<{ fila: number; error: string }>;
}

export interface ListaParticipanteUE {
  id: string;
  unidadEducativaId: string;
  tallerId: string;
  nombre: string;
  documento?: string;
  email?: string;
  telefono?: string;
  genero?: string;
  fechaNac?: string;
  estado?: string;
  observaciones?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const importacionesApi = {
  async importarLista(dto: ImportarListaDto): Promise<ResultadoImportacion> {
    const response = await fetch(`${API_BASE_URL}/importaciones/lista`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al importar la lista' }));
      throw new Error(error.message || 'Error al importar la lista');
    }

    return response.json();
  },

  async obtenerLista(tallerId: string): Promise<ListaParticipanteUE[]> {
    const response = await fetch(`${API_BASE_URL}/importaciones/lista/${tallerId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la lista' }));
      throw new Error(error.message || 'Error al obtener la lista');
    }

    return response.json();
  },

  async eliminarParticipante(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/importaciones/participante/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar el participante' }));
      throw new Error(error.message || 'Error al eliminar el participante');
    }
  },
};

