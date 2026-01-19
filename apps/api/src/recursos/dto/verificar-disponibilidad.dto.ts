import { IsString, IsDateString, IsOptional } from 'class-validator';

export class VerificarDisponibilidadDto {
  @IsString()
  salaId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  reservaId?: string; // Para excluir una reserva existente al verificar (útil en updates)
}

