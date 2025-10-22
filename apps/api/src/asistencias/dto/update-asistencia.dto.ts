import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAsistenciaDto {
  @ApiPropertyOptional({ enum: ['PRESENTE', 'AUSENTE', 'TARDE'] })
  @IsOptional()
  @IsString()
  @IsIn(['PRESENTE', 'AUSENTE', 'TARDE'])
  estado?: string;
}
