import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemAsistenciaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  participanteId!: string;

  @ApiProperty({ enum: ['PRESENTE', 'AUSENTE', 'TARDE'] })
  @IsString()
  @IsIn(['PRESENTE', 'AUSENTE', 'TARDE'])
  estado!: string;
}

export class TomarAsistenciaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sesionId!: string;

  @ApiProperty({ type: [ItemAsistenciaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemAsistenciaDto)
  items!: ItemAsistenciaDto[];
}
