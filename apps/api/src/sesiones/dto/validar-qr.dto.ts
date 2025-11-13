import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidarQRDto {
  @ApiProperty({ description: 'Código QR a validar' })
  @IsString()
  @IsNotEmpty()
  codigoQR!: string;
}


