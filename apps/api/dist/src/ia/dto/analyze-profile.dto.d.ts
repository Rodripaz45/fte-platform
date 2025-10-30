export declare class TallerLiteDto {
    tema: string;
    asistencia_pct: number;
}
export declare class AnalyzeProfileDto {
    participanteId: string;
    talleres?: TallerLiteDto[];
    cvTexto?: string;
}
export interface CompetenciaResult {
    competencia: string;
    nivel: number;
    confianza: number;
}
export interface AnalyzeProfileResponse {
    competencias: CompetenciaResult[];
}
