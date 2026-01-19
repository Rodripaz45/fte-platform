import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreateDisponibilidadDto {
  @IsString()
  trainerId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsEnum(['DISPONIBLE', 'NO_DISPONIBLE', 'OCUPADO'])
  tipo: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}

