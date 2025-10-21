import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class CreateTallereDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tema!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modalidad!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  cupos?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sede?: string;

  @ApiProperty({ default: 'PROGRAMADO' })
  @IsOptional()
  @IsString()
  estado?: string;
}
