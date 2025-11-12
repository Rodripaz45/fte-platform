// Servicio API para Sesiones
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Sesion {
  id: string;
  tallerId: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  responsableId?: string;
  taller?: {
    id: string;
    tema: string;
    modalidad: string;
  };
  responsable?: {
    id: string;
    nombre: string;
    email: string;
  };
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CreateSesionDto {
  tallerId: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  responsableId?: string;
}

export interface UpdateSesionDto {
  tallerId?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  responsableId?: string;
}

export interface SesionesResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Sesion[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const sesionesApi = {
  /**
   * Obtener todas las sesiones (con paginación opcional)
   */
  async getAll(params?: { tallerId?: string; page?: number; pageSize?: number }): Promise<SesionesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.tallerId) queryParams.append('tallerId', params.tallerId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${API_BASE_URL}/sesiones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener sesiones' }));
      throw new Error(error.message || 'Error al obtener sesiones');
    }

    return response.json();
  },

  /**
   * Obtener una sesión por ID
   */
  async getById(id: string): Promise<Sesion> {
    const response = await fetch(`${API_BASE_URL}/sesiones/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la sesión' }));
      throw new Error(error.message || 'Error al obtener la sesión');
    }

    return response.json();
  },

  /**
   * Crear una nueva sesión
   */
  async create(dto: CreateSesionDto): Promise<Sesion> {
    const response = await fetch(`${API_BASE_URL}/sesiones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la sesión' }));
      throw new Error(error.message || 'Error al crear la sesión');
    }

    return response.json();
  },

  /**
   * Actualizar una sesión
   */
  async update(id: string, dto: UpdateSesionDto): Promise<Sesion> {
    const response = await fetch(`${API_BASE_URL}/sesiones/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la sesión' }));
      throw new Error(error.message || 'Error al actualizar la sesión');
    }

    return response.json();
  },

  /**
   * Eliminar una sesión
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sesiones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la sesión' }));
      throw new Error(error.message || 'Error al eliminar la sesión');
    }
  },
};

