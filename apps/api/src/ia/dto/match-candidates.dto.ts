import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class MatchCandidatesDto {
  @IsString()
  puestoTexto: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  topK?: number = 6;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minCompetencias?: number = 0; // Cantidad mínima de competencias coincidentes para incluir candidato

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 50; // Límite de candidatos a retornar
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
  porcentajeMatch: number; // Porcentaje de competencias coincidentes
  promedioNivel: number; // Promedio de niveles de competencias coincidentes (para desempate)
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

