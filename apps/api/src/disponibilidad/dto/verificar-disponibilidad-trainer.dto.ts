import { IsString, IsDateString, IsOptional } from 'class-validator';

export class VerificarDisponibilidadTrainerDto {
  @IsString()
  trainerId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  disponibilidadId?: string; // Para excluir una disponibilidad existente al verificar
}

