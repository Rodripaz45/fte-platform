import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCvDto {
  @ApiProperty({ required: false, description: 'Nueva URL del PDF', example: 'https://storage.example.com/cvs/mi-cv-v2.pdf' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false, description: 'Nueva versión del CV', example: 'v3' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ required: false, description: 'Texto del CV (limpio)', example: 'Profesional con experiencia en...' })
  @IsOptional()
  @IsString()
  texto?: string;
}


