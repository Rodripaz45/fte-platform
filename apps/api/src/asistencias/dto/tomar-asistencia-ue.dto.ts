import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemAsistenciaUEDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  listaParticipanteUEId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  estado?: string; // 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class TomarAsistenciaUEDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  sesionId!: string;

  @ApiProperty({ type: [ItemAsistenciaUEDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemAsistenciaUEDto)
  items!: ItemAsistenciaUEDto[];
}

