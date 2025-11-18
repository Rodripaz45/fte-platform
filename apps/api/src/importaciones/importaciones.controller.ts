import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ImportacionesService } from './importaciones.service';
import { ImportarListaDto } from './dto/importar-lista.dto';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('importaciones')
export class ImportacionesController {
  constructor(private readonly importacionesService: ImportacionesService) {}

  @Roles('ADMIN', 'TRAINER')
  @Post('lista')
  @ApiOperation({ summary: 'Importar lista de participantes desde CSV/Excel' })
  @ApiResponse({ status: 201, description: 'Lista importada exitosamente' })
  importarLista(@Body() dto: ImportarListaDto) {
    return this.importacionesService.importarLista(dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('lista/:tallerId')
  @ApiOperation({ summary: 'Obtener lista de participantes de un taller UE' })
  obtenerLista(@Param('tallerId') tallerId: string) {
    return this.importacionesService.obtenerListaParticipantes(tallerId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete('participante/:id')
  @ApiOperation({ summary: 'Eliminar un participante de la lista' })
  eliminarParticipante(@Param('id') id: string) {
    return this.importacionesService.eliminarParticipante(id);
  }
}

