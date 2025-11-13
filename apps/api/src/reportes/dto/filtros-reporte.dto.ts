import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrosReporteDto {
  @ApiPropertyOptional({ description: 'Fecha de inicio del periodo (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del periodo (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'Modalidad del taller (PRESENCIAL, VIRTUAL, MIXTA)' })
  @IsOptional()
  @IsString()
  modalidad?: string;

  @ApiPropertyOptional({ description: 'ID del taller específico' })
  @IsOptional()
  @IsString()
  tallerId?: string;

  @ApiPropertyOptional({ description: 'ID del participante específico' })
  @IsOptional()
  @IsString()
  participanteId?: string;
}

