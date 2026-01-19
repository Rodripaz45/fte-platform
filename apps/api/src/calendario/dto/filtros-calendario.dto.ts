import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class FiltrosCalendarioDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  trainerId?: string;

  @IsOptional()
  @IsString()
  sede?: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return [value];
  })
  @IsArray()
  @IsString({ each: true })
  tiposEvento?: string[]; // 'TALLER' | 'SESION' | 'BLOQUEO' | 'FERIADO'
}

