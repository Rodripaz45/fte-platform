import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInscripcioneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  participanteId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tallerId!: string;
}
