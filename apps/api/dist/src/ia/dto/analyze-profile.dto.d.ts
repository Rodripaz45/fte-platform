export declare class TallerLiteDto {
    tema: string;
    asistencia_pct: number;
}
export declare class AnalyzeProfileDto {
    participanteId: string;
    incluirCV?: boolean;
    incluirTalleres?: boolean;
    talleres?: TallerLiteDto[];
    cvTexto?: string;
    useML?: boolean;
}
export interface CompetenciaResult {
    competencia: string;
    nivel: number;
    confianza: number;
}
export interface AnalyzeProfileResponse {
    competencias: CompetenciaResult[];
}
