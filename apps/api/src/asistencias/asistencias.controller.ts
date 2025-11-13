import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, BadRequestException } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RegistrarAsistenciaQRDto } from './dto/registrar-asistencia-qr.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import type { Request as ExpressRequest } from 'express';

@ApiBearerAuth()
@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  // Masivo
  @Roles('TRAINER', 'ADMIN')
  @Post('tomar')
  tomar(@Body() dto: TomarAsistenciaDto) {
    return this.asistenciasService.tomar(dto);
  }

  // Individual (opcional)
  @Roles('TRAINER', 'ADMIN')
  @Post()
  create(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciasService.create(dto);
  }

  @Roles('TRAINER', 'ADMIN')
  @Get()
  findAll(@Query('sesionId') sesionId?: string) {
    return this.asistenciasService.findAll({ sesionId });
  }

  @Roles('TRAINER', 'ADMIN')
  @Get('resumen')
  resumen(@Query('sesionId') sesionId: string) {
    return this.asistenciasService.resumenPorSesion(sesionId);
  }

  @Roles('TRAINER', 'ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciasService.findOne(id);
  }

  @Roles('TRAINER', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAsistenciaDto) {
    return this.asistenciasService.update(id, dto);
  }

  @Roles('TRAINER', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciasService.remove(id);
  }

  @Roles('PARTICIPANTE')
  @Post('registrar-qr')
  @ApiOperation({ summary: 'Registrar asistencia mediante código QR (solo para participantes)' })
  @ApiResponse({ status: 201, description: 'Asistencia registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Código QR inválido o expirado' })
  async registrarAsistenciaPorQR(@Body() dto: RegistrarAsistenciaQRDto, @Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    // Obtener participanteId del usuario usando PrismaService directamente
    const prisma = this.asistenciasService['prisma'];
    const participante = await prisma.participante.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (!participante) {
      throw new BadRequestException('Usuario no tiene perfil de participante');
    }

    return this.asistenciasService.registrarAsistenciaPorQR(dto, participante.id);
  }
}
