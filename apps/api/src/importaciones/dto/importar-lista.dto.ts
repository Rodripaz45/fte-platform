import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsArray, ValidateNested, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipanteImportadoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

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
  @IsString()
  fechaNac?: string;
}

export class ImportarListaDto {
  @ApiProperty({ description: 'ID del taller de tipo UNIDAD_EDUCATIVA' })
  @IsUUID()
  @IsNotEmpty()
  tallerId!: string;

  @ApiProperty({ 
    description: 'Datos de participantes en formato JSON (array de objetos)',
    type: [ParticipanteImportadoDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipanteImportadoDto)
  participantes!: ParticipanteImportadoDto[];
}

