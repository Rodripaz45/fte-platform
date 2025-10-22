import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  // Masivo
  @Post('tomar')
  tomar(@Body() dto: TomarAsistenciaDto) {
    return this.asistenciasService.tomar(dto);
  }

  // Individual (opcional)
  @Post()
  create(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciasService.create(dto);
  }

  @Get()
  findAll(@Query('sesionId') sesionId?: string) {
    return this.asistenciasService.findAll({ sesionId });
  }

  @Get('resumen')
  resumen(@Query('sesionId') sesionId: string) {
    return this.asistenciasService.resumenPorSesion(sesionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAsistenciaDto) {
    return this.asistenciasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciasService.remove(id);
  }
}
