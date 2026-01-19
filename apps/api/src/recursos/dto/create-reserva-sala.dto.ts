import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateReservaSalaDto {
  @IsString()
  salaId: string;

  @IsOptional()
  @IsString()
  sesionId?: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsEnum(['RESERVADA', 'CONFIRMADA', 'CANCELADA'])
  estado?: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}

