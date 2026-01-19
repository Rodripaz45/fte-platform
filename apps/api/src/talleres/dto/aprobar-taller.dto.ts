import { IsString, IsOptional, IsEnum } from 'class-validator';

export class AprobarTallerDto {
  @IsEnum(['APROBADO', 'RECHAZADO', 'EN_REVISION'])
  estadoAprobacion: 'APROBADO' | 'RECHAZADO' | 'EN_REVISION';

  @IsOptional()
  @IsString()
  comentarios?: string;
}
