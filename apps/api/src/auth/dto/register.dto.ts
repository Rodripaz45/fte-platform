import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    required: false,
    description: 'Rol opcional: ADMIN | STAFF | TRAINER | PARTICIPANTE (por defecto PARTICIPANTE)',
  })
  @IsOptional()
  @IsString()
  rol?: string;
}
