import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tallerId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  participanteId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  puntaje!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comentario?: string;
}
