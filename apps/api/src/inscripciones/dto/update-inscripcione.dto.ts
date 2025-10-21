import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateInscripcioneDto {
  @ApiPropertyOptional({ enum: ['INSCRITO', 'CANCELADO', 'FINALIZADO'] })
  @IsOptional()
  @IsString()
  @IsIn(['INSCRITO', 'CANCELADO', 'FINALIZADO'])
  estado?: string;
}
