import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSesionDto {
  @ApiProperty({ description: 'ID del taller' })
  @IsString()
  @IsNotEmpty()
  tallerId!: string;

  @ApiProperty({ description: 'Fecha de la sesión (ISO)' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha!: Date;

  @ApiPropertyOptional({ description: 'Hora de inicio (ISO)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaInicio?: Date;

  @ApiPropertyOptional({ description: 'Hora de fin (ISO)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaFin?: Date;

  @ApiPropertyOptional({ description: 'Usuario responsable (opcional)' })
  @IsOptional()
  @IsString()
  responsableId?: string;
}
