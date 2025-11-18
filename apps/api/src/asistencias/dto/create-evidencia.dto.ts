import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEvidenciaDto {
  @ApiProperty({ description: 'ID de la sesión' })
  @IsUUID()
  @IsNotEmpty()
  sesionId!: string;

  @ApiProperty({ description: 'Tipo de evidencia (ej: "SCREENSHOT", "FOTO", "ARCHIVO")', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiProperty({ description: 'URL de la evidencia (subida a Firebase Storage)' })
  @IsString()
  @IsNotEmpty()
  url!: string;
}

