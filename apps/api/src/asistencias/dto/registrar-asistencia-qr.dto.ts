import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegistrarAsistenciaQRDto {
  @ApiProperty({ description: 'Código QR de la sesión' })
  @IsString()
  @IsNotEmpty()
  codigoQR!: string;
}


