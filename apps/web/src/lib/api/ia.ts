// Servicio API para IA
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CompetenciaJobResult {
  competencia: string;
  relevancia: number;
  descripcion?: string;
}

export interface AnalyzeJobResponse {
  competencias: CompetenciaJobResult[];
  meta: {
    total?: number;
    tiempo?: number;
  };
}

export interface AnalyzeJobDto {
  puestoTexto: string;
  topK?: number;
}

export interface CompetenciaMatch {
  competencia: string;
  nivel: number;
  relevancia: number;
  confianza?: number;
}

export interface CandidatoMatch {
  participanteId: string;
  nombre: string;
  email: string;
  porcentajeMatch: number;
  promedioNivel: number;
  competenciasCoincidentes: CompetenciaMatch[];
  competenciasFaltantes: string[];
  totalCompetenciasRequeridas: number;
  totalCompetenciasCoincidentes: number;
}

export interface MatchCandidatesDto {
  puestoTexto: string;
  topK?: number;
  minCompetencias?: number;
  limit?: number;
}

export interface MatchCandidatesResponse {
  candidatos: CandidatoMatch[];
  total: number;
  competenciasRequeridas: {
    competencia: string;
    relevancia: number;
  }[];
  meta: {
    tiempo?: number;
  };
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const iaApi = {
  /**
   * Analizar competencias requeridas para un puesto de trabajo
   */
  async analyzeJob(dto: AnalyzeJobDto): Promise<AnalyzeJobResponse> {
    const response = await fetch(`${API_BASE_URL}/ia/analyze/job`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        puestoTexto: dto.puestoTexto,
        topK: dto.topK || 6,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al analizar el puesto' }));
      throw new Error(error.message || 'Error al analizar el puesto de trabajo');
    }

    return response.json();
  },

  /**
   * Encontrar candidatos que coincidan con las competencias de un puesto
   */
  async matchCandidates(dto: MatchCandidatesDto): Promise<MatchCandidatesResponse> {
    const response = await fetch(`${API_BASE_URL}/ia/match-candidates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        puestoTexto: dto.puestoTexto,
        topK: dto.topK || 6,
        minCompetencias: dto.minCompetencias || 0,
        limit: dto.limit || 50,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al buscar candidatos' }));
      throw new Error(error.message || 'Error al buscar candidatos');
    }

    return response.json();
  },
};
