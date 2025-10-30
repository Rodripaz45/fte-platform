import { IsOptional, IsString } from 'class-validator';

export class UpdateCvDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  texto?: string;
}


