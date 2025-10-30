import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiProperty({ description: 'ID del participante', example: '88417ff0-c107-4c73-b3ce-aaa47415e30b' })
  @IsString()
  participanteId: string;

  @ApiProperty({ description: 'URL pública de descarga directa del PDF', example: 'https://storage.example.com/cvs/mi-cv.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ required: false, description: 'Versión del CV', example: 'v2' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ required: false, description: 'Texto del CV (si se omite, se extrae del PDF)', example: 'Profesional con experiencia en...' })
  @IsOptional()
  @IsString()
  texto?: string;
}


