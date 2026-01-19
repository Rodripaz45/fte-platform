import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const DIAS_VALIDOS = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const;

export class CreateSesionesRecurrentesDto {
  @ApiProperty({ description: 'ID del taller' })
  @IsString()
  @IsNotEmpty()
  tallerId!: string;

  @ApiProperty({ description: 'Fecha inicial del rango (inclusive)' })
  @Type(() => Date)
  @IsDate()
  fechaInicio!: Date;

  @ApiProperty({ description: 'Fecha final del rango (inclusive)' })
  @Type(() => Date)
  @IsDate()
  fechaFin!: Date;

  @ApiProperty({
    description: 'Días de la semana en los que se crearán sesiones',
    example: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  diasSemana!: string[];

  @ApiPropertyOptional({ description: 'Hora de inicio (ISO) aplicable a todas las sesiones' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaInicio?: Date;

  @ApiPropertyOptional({ description: 'Hora de fin (ISO) aplicable a todas las sesiones' })
  @IsOptional()
  @ValidateIf((obj) => !!obj.horaInicio)
  @Type(() => Date)
  @IsDate()
  horaFin?: Date;

  @ApiPropertyOptional({ description: 'Usuario responsable (opcional)' })
  @IsOptional()
  @IsString()
  responsableId?: string;

  @ApiPropertyOptional({ description: 'ID de la sala (opcional, para sesiones presenciales)' })
  @IsOptional()
  @IsString()
  salaId?: string;
}
