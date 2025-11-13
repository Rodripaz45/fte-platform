import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CanalNotificacion {
  EMAIL = 'EMAIL',
  WEB = 'WEB',
  SMS = 'SMS',
}

export enum TipoNotificacion {
  RECORDATORIO_SESION = 'RECORDATORIO_SESION',
  CONFIRMACION_INSCRIPCION = 'CONFIRMACION_INSCRIPCION',
  NUEVO_TALLER = 'NUEVO_TALLER',
  RECORDATORIO_ENCUESTA = 'RECORDATORIO_ENCUESTA',
  ASISTENCIA_REGISTRADA = 'ASISTENCIA_REGISTRADA',
  TALLER_CANCELADO = 'TALLER_CANCELADO',
  TALLER_MODIFICADO = 'TALLER_MODIFICADO',
  OTRO = 'OTRO',
}

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  LEIDA = 'LEIDA',
  FALLIDA = 'FALLIDA',
}

export class CreateNotificacionDto {
  @ApiProperty({ description: 'ID del usuario destinatario' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ 
    description: 'Canal de notificación',
    enum: CanalNotificacion,
    required: false,
    default: CanalNotificacion.WEB
  })
  @IsEnum(CanalNotificacion)
  @IsOptional()
  canal?: CanalNotificacion;

  @ApiProperty({ 
    description: 'Tipo de notificación',
    enum: TipoNotificacion,
    required: false
  })
  @IsEnum(TipoNotificacion)
  @IsOptional()
  tipo?: TipoNotificacion;

  @ApiProperty({ 
    description: 'Estado de la notificación',
    enum: EstadoNotificacion,
    required: false,
    default: EstadoNotificacion.PENDIENTE
  })
  @IsEnum(EstadoNotificacion)
  @IsOptional()
  estado?: EstadoNotificacion;

  @ApiProperty({ description: 'Título de la notificación', required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ description: 'Mensaje de la notificación', required: false })
  @IsString()
  @IsOptional()
  mensaje?: string;
}

