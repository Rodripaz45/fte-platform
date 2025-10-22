import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSesionDto {
  @ApiProperty({ description: 'ID del taller' })
  @IsString()
  @IsNotEmpty()
  tallerId!: string;

  @ApiProperty({ description: 'Fecha de la sesión (ISO)' })
  @IsDateString()
  fecha!: Date;

  @ApiPropertyOptional({ description: 'Hora de inicio (ISO)' })
  @IsOptional()
  @IsDateString()
  horaInicio?: Date;

  @ApiPropertyOptional({ description: 'Hora de fin (ISO)' })
  @IsOptional()
  @IsDateString()
  horaFin?: Date;

  @ApiPropertyOptional({ description: 'Usuario responsable (opcional)' })
  @IsOptional()
  @IsString()
  responsableId?: string;
}
