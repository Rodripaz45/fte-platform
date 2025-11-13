import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainerDto {
  @ApiProperty({ description: 'Nombre completo del trainer' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Email del trainer' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del trainer (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Estado del trainer', required: false, default: 'ACTIVO' })
  @IsString()
  @IsOptional()
  estado?: string;
}

