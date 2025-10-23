import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';

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
}
