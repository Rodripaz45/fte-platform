import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';

@ApiTags('notificaciones')
@ApiBearerAuth()
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * Obtener mis notificaciones (usuario autenticado)
   */
  @Get('me')
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  @ApiQuery({ name: 'soloNoLeidas', required: false, type: Boolean, description: 'Solo mostrar no leídas' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  async getMisNotificaciones(
    @Req() req: ExpressRequest,
    @Query('soloNoLeidas') soloNoLeidas?: string,
    @Query('limit') limit?: string,
  ) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    return this.notificacionesService.findByUsuario(userId, {
      soloNoLeidas: soloNoLeidas === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Contar notificaciones no leídas del usuario autenticado
   */
  @Get('me/count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas' })
  async countNoLeidas(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    const count = await this.notificacionesService.countNoLeidas(userId);
    return { count };
  }

  /**
   * Marcar todas mis notificaciones como leídas
   */
  @Patch('me/marcar-todas-leidas')
  @ApiOperation({ summary: 'Marcar todas mis notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas como leídas' })
  async marcarTodasComoLeidas(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    return this.notificacionesService.marcarTodasComoLeidas(userId);
  }

  /**
   * Obtener una notificación por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(id);
  }

  /**
   * Marcar una notificación como leída
   */
  @Patch(':id/leida')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id);
  }

  /**
   * Actualizar una notificación
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateNotificacionDto) {
    return this.notificacionesService.update(id, dto);
  }

  /**
   * Eliminar una notificación
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(id);
  }

  /**
   * Crear una notificación (solo ADMIN)
   */
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Crear una notificación (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Notificación creada' })
  create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionesService.create(dto);
  }
}

