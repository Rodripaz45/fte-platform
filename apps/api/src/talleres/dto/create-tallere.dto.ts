import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTallereDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  tema!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  modalidad!: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1)
  cupos?: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Date) @IsDate()
  fechaInicio?: Date;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Date) @IsDate()
  fechaFin?: Date;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  sede?: string;

  @ApiProperty({ default: 'PROGRAMADO' }) @IsOptional() @IsString()
  estado?: string;

  @ApiProperty({ description: 'ID del trainer asignado al taller' }) @IsUUID() @IsNotEmpty()
  trainerId!: string;

  @ApiProperty({ required: false, description: 'Tipo de taller: NORMAL o UNIDAD_EDUCATIVA' }) 
  @IsOptional() 
  @IsString()
  tipo?: string;

  @ApiProperty({ required: false, description: 'ID de la unidad educativa (requerido si tipo es UNIDAD_EDUCATIVA)' }) 
  @IsOptional() 
  @IsUUID()
  unidadEducativaId?: string;

  @ApiProperty({ required: false, description: 'Nombre de la unidad educativa (se creará si no existe)' }) 
  @IsOptional() 
  @IsString()
  unidadEducativaNombre?: string;

  @ApiProperty({ required: false, description: 'Descripción de las capacidades o habilidades que se adquirirán en el taller' }) 
  @IsOptional() 
  @IsString()
  capacidades?: string;
}
