export declare class AnalyzeJobDto {
    puestoTexto: string;
    topK?: number;
}
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
