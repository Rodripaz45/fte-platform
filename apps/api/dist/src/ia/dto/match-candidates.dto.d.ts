export declare class MatchCandidatesDto {
    puestoTexto: string;
    topK?: number;
    minCompetencias?: number;
    limit?: number;
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
