import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  nombre: string;

  @IsString()
  sede: string;

  @IsInt()
  @Min(1)
  capacidad: number;

  @IsOptional()
  @IsString()
  equipamiento?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

