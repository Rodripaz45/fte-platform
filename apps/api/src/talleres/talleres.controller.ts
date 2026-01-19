import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { AprobarTallerDto } from './dto/aprobar-taller.dto';
import { Roles } from '../auth/roles.decorator'; // ← usa ruta relativa si no tienes path alias
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
// import type { Role } from '../../auth/role.enum'; // (opcional, no lo necesitas aquí)

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string; roles: string[] };
}

@ApiBearerAuth()
@Controller('talleres')
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Post()
  create(@Body() createTallereDto: CreateTallereDto) {
    return this.talleresService.create(createTallereDto);
  }

  // Listar puede quedar abierto a cualquier autenticado (si tienes JwtGuard global)
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    // Si el usuario es TRAINER, filtrar por su trainerId
    if (user.roles.includes('TRAINER')) {
      return this.talleresService.findAllByTrainerId(user.sub);
    }
    // Si es ADMIN, DIRECTOR u otro rol, mostrar todos
    return this.talleresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.talleresService.findOne(id);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallereDto: UpdateTallereDto) {
    return this.talleresService.update(id, updateTallereDto);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.talleresService.remove(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.talleresService.publicar(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post(':id/cerrar')
  cerrar(@Param('id') id: string) {
    return this.talleresService.cerrar(id);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Post(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar taller y generar certificados automáticamente' })
  @ApiResponse({ status: 200, description: 'Taller finalizado y certificados generados' })
  finalizar(@Param('id') id: string) {
    return this.talleresService.finalizar(id);
  }

  @Roles('ADMIN', 'DIRECTOR')
  @Post(':id/asignar-trainer')
  @ApiOperation({ summary: 'Asignar un trainer a un taller (solo Director/Admin)' })
  @ApiResponse({ status: 200, description: 'Trainer asignado correctamente' })
  asignarTrainer(
    @Param('id') id: string,
    @Body('trainerId') trainerId: string,
  ) {
    return this.talleresService.asignarTrainer(id, trainerId);
  }

  @Roles('ADMIN', 'DIRECTOR')
  @Get('pendientes-aprobacion')
  @ApiOperation({ summary: 'Obtener talleres pendientes de aprobación (solo Director/Admin)' })
  obtenerPendientesAprobacion() {
    return this.talleresService.obtenerPendientesAprobacion();
  }

  @Roles('ADMIN', 'DIRECTOR')
  @Post(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar, rechazar o enviar a revisión un taller (solo Director/Admin)' })
  @ApiResponse({ status: 200, description: 'Taller aprobado/rechazado correctamente' })
  aprobarTaller(
    @Param('id') id: string,
    @Body() dto: AprobarTallerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.talleresService.aprobarTaller(id, req.user.sub, dto);
  }

  @Roles('TRAINER')
  @Post(':id/enviar-revision')
  @ApiOperation({ summary: 'Enviar taller a revisión (solo Trainer)' })
  @ApiResponse({ status: 200, description: 'Taller enviado a revisión' })
  enviarARevision(@Param('id') id: string) {
    return this.talleresService.enviarARevision(id);
  }

  @Roles('TRAINER', 'ADMIN', 'DIRECTOR')
  @Get('estadisticas/:trainerId')
  @ApiOperation({ summary: 'Obtener estadísticas de un trainer' })
  @ApiResponse({ status: 200, description: 'Estadísticas del trainer' })
  obtenerEstadisticasTrainer(@Param('trainerId') trainerId: string, @Req() req: AuthenticatedRequest) {
    // Si es TRAINER, solo puede ver sus propias estadísticas
    if (req.user.roles.includes('TRAINER') && req.user.sub !== trainerId) {
      throw new BadRequestException('Solo puedes ver tus propias estadísticas');
    }
    return this.talleresService.obtenerEstadisticasTrainer(trainerId);
  }

  @Roles('TRAINER')
  @Get('mis-estadisticas')
  @ApiOperation({ summary: 'Obtener mis estadísticas (solo Trainer)' })
  @ApiResponse({ status: 200, description: 'Estadísticas del trainer autenticado' })
  obtenerMisEstadisticas(@Req() req: AuthenticatedRequest) {
    return this.talleresService.obtenerEstadisticasTrainer(req.user.sub);
  }
}
