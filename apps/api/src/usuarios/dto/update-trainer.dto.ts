import { PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrainerDto } from './create-trainer.dto';

export class UpdateTrainerDto extends PartialType(CreateTrainerDto) {
  @ApiProperty({ description: 'Nueva contraseña (opcional, mínimo 6 caracteres)', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

