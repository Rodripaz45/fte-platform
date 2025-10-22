import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  puntaje?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comentario?: string;
}
