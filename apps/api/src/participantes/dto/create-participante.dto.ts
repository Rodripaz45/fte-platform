import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateParticipanteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaNac?: Date;
}
