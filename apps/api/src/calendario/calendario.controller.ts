import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendarioService } from './calendario.service';
import { FiltrosCalendarioDto } from './dto/filtros-calendario.dto';

@ApiTags('Calendario')
@ApiBearerAuth()
@Controller('calendario')
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Get('eventos')
  @ApiOperation({ summary: 'Obtener eventos del calendario con filtros' })
  obtenerEventos(@Query() filtros: FiltrosCalendarioDto) {
    return this.calendarioService.obtenerEventos(filtros);
  }

  @Get('conflictos')
  @ApiOperation({ summary: 'Detectar conflictos en el calendario' })
  detectarConflictos(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.calendarioService.detectarConflictos(fechaInicio, fechaFin);
  }
}

