import { IsOptional, IsString } from 'class-validator';

export class CreateCvDto {
  @IsString()
  participanteId: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  texto?: string;
}


