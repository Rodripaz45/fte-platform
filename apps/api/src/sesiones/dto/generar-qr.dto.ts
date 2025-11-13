import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class GenerarQRDto {
  @ApiProperty({ description: 'ID de la sesión' })
  @IsString()
  @IsNotEmpty()
  sesionId!: string;

  @ApiPropertyOptional({ 
    description: 'Duración del código en minutos (por defecto: 60 minutos)',
    default: 60,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duracionMinutos?: number;
}


