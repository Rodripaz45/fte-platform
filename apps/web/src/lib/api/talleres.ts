// Servicio API para Talleres
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Trainer {
  id: string;
  nombre: string;
  email: string;
}

export interface UnidadEducativa {
  id: string;
  nombre: string;
  codigo?: string;
}

export interface Taller {
  id: string;
  tema: string;
  modalidad: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
  tipo?: string; // 'NORMAL' | 'UNIDAD_EDUCATIVA'
  capacidades?: string; // Descripción de capacidades/habilidades que se adquirirán
  trainerId: string;
  trainer?: Trainer;
  unidadEducativaId?: string;
  unidadEducativa?: UnidadEducativa;
  directorId?: string;
  director?: Trainer;
  estadoAprobacion?: string; // 'BORRADOR' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'
  creadoEn?: string;
  actualizadoEn?: string;
  // Campos adicionales para información de cupos
  cuposDisponibles?: number | null;
  cuposOcupados?: number;
  tieneCuposLimitados?: boolean;
  _count?: {
    sesiones?: number;
    inscripciones?: number;
  };
}

export interface CreateTallerDto {
  tema: string;
  modalidad: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
  tipo?: string; // 'NORMAL' | 'UNIDAD_EDUCATIVA'
  capacidades?: string; // Descripción de capacidades/habilidades que se adquirirán
  trainerId: string;
  unidadEducativaId?: string;
  unidadEducativaNombre?: string;
}

export interface UpdateTallerDto {
  tema?: string;
  modalidad?: string;
  cupos?: number;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  estado?: string;
  tipo?: string;
  trainerId?: string;
  unidadEducativaId?: string;
  unidadEducativaNombre?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const talleresApi = {
  /**
   * Obtener todos los talleres
   */
  async getAll(): Promise<Taller[]> {
    const response = await fetch(`${API_BASE_URL}/talleres`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener talleres' }));
      throw new Error(error.message || 'Error al obtener talleres');
    }

    return response.json();
  },

  /**
   * Obtener un taller por ID
   */
  async getById(id: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener el taller' }));
      throw new Error(error.message || 'Error al obtener el taller');
    }

    return response.json();
  },

  /**
   * Crear un nuevo taller
   */
  async create(dto: CreateTallerDto): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      let error: any;
      const contentType = response.headers.get('content-type');
      try {
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          error = { message: text || `Error ${response.status}: ${response.statusText}` };
        }
      } catch (e) {
        error = { message: `Error ${response.status}: ${response.statusText}` };
      }
      // Mostrar el mensaje completo del error, incluyendo detalles de validación
      console.error('Error completo del backend:', error);
      console.error('Status:', response.status);
      console.error('StatusText:', response.statusText);
      
      // Extraer mensaje de error de diferentes formatos posibles
      let errorMessage = 'Error al crear el taller';
      if (error) {
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ');
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        } else if (Array.isArray(error)) {
          errorMessage = error.map((e: any) => e.message || JSON.stringify(e)).join(', ');
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Actualizar un taller
   */
  async update(id: string, dto: UpdateTallerDto): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar el taller' }));
      throw new Error(error.message || 'Error al actualizar el taller');
    }

    return response.json();
  },

  /**
   * Eliminar un taller
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar el taller' }));
      throw new Error(error.message || 'Error al eliminar el taller');
    }
  },

  /**
   * Publicar un taller (cambia estado a PUBLICADO)
   */
  async publicar(id: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}/publicar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al publicar el taller' }));
      throw new Error(error.message || 'Error al publicar el taller');
    }

    return response.json();
  },

  /**
   * Cerrar un taller (cambia estado a CERRADO)
   */
  async cerrar(id: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}/cerrar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al cerrar el taller' }));
      throw new Error(error.message || 'Error al cerrar el taller');
    }

    return response.json();
  },

  /**
   * Finalizar un taller (cambia estado a FINALIZADO y genera certificados automáticamente)
   */
  async finalizar(id: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${id}/finalizar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al finalizar el taller' }));
      throw new Error(error.message || 'Error al finalizar el taller');
    }

    return response.json();
  },

  /**
   * Asignar un trainer a un taller (solo Director/Admin)
   */
  async asignarTrainer(tallerId: string, trainerId: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${tallerId}/asignar-trainer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ trainerId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al asignar trainer' }));
      throw new Error(error.message || 'Error al asignar trainer');
    }

    return response.json();
  },

  /**
   * Obtener talleres pendientes de aprobación (solo Director/Admin)
   */
  async getPendientesAprobacion(): Promise<Taller[]> {
    const response = await fetch(`${API_BASE_URL}/talleres/pendientes-aprobacion`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener talleres pendientes' }));
      throw new Error(error.message || 'Error al obtener talleres pendientes');
    }

    return response.json();
  },

  /**
   * Aprobar, rechazar o enviar a revisión un taller (solo Director/Admin)
   */
  async aprobarTaller(
    tallerId: string,
    estadoAprobacion: 'APROBADO' | 'RECHAZADO' | 'EN_REVISION',
    comentarios?: string,
  ): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${tallerId}/aprobar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estadoAprobacion, comentarios }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al aprobar/rechazar el taller' }));
      throw new Error(error.message || 'Error al aprobar/rechazar el taller');
    }

    return response.json();
  },

  /**
   * Enviar taller a revisión (solo Trainer)
   */
  async enviarARevision(tallerId: string): Promise<Taller> {
    const response = await fetch(`${API_BASE_URL}/talleres/${tallerId}/enviar-revision`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al enviar taller a revisión' }));
      throw new Error(error.message || 'Error al enviar taller a revisión');
    }

    return response.json();
  },

  /**
   * Obtener estadísticas de un trainer
   */
  async getEstadisticasTrainer(trainerId?: string): Promise<EstadisticasTrainer> {
    const url = trainerId
      ? `${API_BASE_URL}/talleres/estadisticas/${trainerId}`
      : `${API_BASE_URL}/talleres/mis-estadisticas`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener estadísticas' }));
      throw new Error(error.message || 'Error al obtener estadísticas');
    }

    return response.json();
  },
};

export interface EstadisticasTrainer {
  trainerId: string;
  totalTalleres: number;
  talleresPublicados: number;
  talleresEnCurso: number;
  talleresFinalizados: number;
  totalSesiones: number;
  totalInscripciones: number;
  totalAsistencias: number;
  tasaAsistenciaPromedio: number;
  satisfaccionPromedio: number;
  totalRetroalimentaciones: number;
  participantesCertificados: number;
  participantesUnicos: number;
  talleresPorModalidad: { modalidad: string; cantidad: number }[];
  talleresPorEstado: { estado: string; cantidad: number }[];
}
