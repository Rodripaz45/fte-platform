import { PartialType } from '@nestjs/swagger';
import { CreateNotificacionDto, EstadoNotificacion } from './create-notificacion.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificacionDto extends PartialType(CreateNotificacionDto) {
  @ApiProperty({ 
    description: 'Estado de la notificación',
    enum: EstadoNotificacion,
    required: false
  })
  @IsEnum(EstadoNotificacion)
  @IsOptional()
  estado?: EstadoNotificacion;
}

