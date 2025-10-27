import { IsString, IsNumber, Min, Max } from 'class-validator';

export class AnalyzeJobDto {
  @IsString()
  puestoTexto: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  topK?: number = 6;
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

