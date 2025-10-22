import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateAsistenciaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sesionId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  participanteId!: string;

  @ApiProperty({ enum: ['PRESENTE', 'AUSENTE', 'TARDE'] })
  @IsString()
  @IsIn(['PRESENTE', 'AUSENTE', 'TARDE'])
  estado!: string;
}
