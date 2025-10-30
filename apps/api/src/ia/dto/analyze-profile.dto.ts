import { IsString, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TallerLiteDto {
  @IsString()
  tema: string;

  @IsNumber()
  asistencia_pct: number;
}

export class AnalyzeProfileDto {
  @IsString()
  participanteId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TallerLiteDto)
  @IsOptional()
  talleres?: TallerLiteDto[];

  @IsString()
  @IsOptional()
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

