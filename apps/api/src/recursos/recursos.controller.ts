import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RecursosService } from './recursos.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { CreateReservaSalaDto } from './dto/create-reserva-sala.dto';
import { UpdateReservaSalaDto } from './dto/update-reserva-sala.dto';
import { VerificarDisponibilidadDto } from './dto/verificar-disponibilidad.dto';

@ApiTags('Recursos')
@ApiBearerAuth()
@Controller('recursos')
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  // ========== SALAS ==========

  @Roles('ADMIN', 'DIRECTOR')
  @Post('salas')
  @ApiOperation({ summary: 'Crear una nueva sala' })
  createSala(@Body() createSalaDto: CreateSalaDto) {
    return this.recursosService.createSala(createSalaDto);
  }

  @Get('salas')
  @ApiOperation({ summary: 'Listar todas las salas' })
  findAllSalas(
    @Query('sede') sede?: string,
    @Query('activa') activa?: string,
  ) {
    return this.recursosService.findAllSalas(
      sede,
      activa === 'true' ? true : activa === 'false' ? false : undefined,
    );
  }

  @Get('salas/:id')
  @ApiOperation({ summary: 'Obtener una sala por ID' })
  findOneSala(@Param('id') id: string) {
    return this.recursosService.findOneSala(id);
  }

  @Roles('ADMIN', 'DIRECTOR')
  @Patch('salas/:id')
  @ApiOperation({ summary: 'Actualizar una sala' })
  updateSala(@Param('id') id: string, @Body() updateSalaDto: UpdateSalaDto) {
    return this.recursosService.updateSala(id, updateSalaDto);
  }

  @Roles('ADMIN', 'DIRECTOR')
  @Delete('salas/:id')
  @ApiOperation({ summary: 'Eliminar una sala' })
  removeSala(@Param('id') id: string) {
    return this.recursosService.removeSala(id);
  }

  // ========== RESERVAS ==========

  @Post('reservas/verificar-disponibilidad')
  @ApiOperation({ summary: 'Verificar disponibilidad de una sala' })
  verificarDisponibilidad(@Body() dto: VerificarDisponibilidadDto) {
    return this.recursosService.verificarDisponibilidad(dto);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Post('reservas')
  @ApiOperation({ summary: 'Crear una nueva reserva de sala' })
  createReserva(@Body() createReservaDto: CreateReservaSalaDto) {
    return this.recursosService.createReserva(createReservaDto);
  }

  @Get('reservas')
  @ApiOperation({ summary: 'Listar todas las reservas' })
  findAllReservas(
    @Query('salaId') salaId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.recursosService.findAllReservas(salaId, fechaInicio, fechaFin);
  }

  @Get('reservas/:id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  findOneReserva(@Param('id') id: string) {
    return this.recursosService.findOneReserva(id);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Patch('reservas/:id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  updateReserva(
    @Param('id') id: string,
    @Body() updateReservaDto: UpdateReservaSalaDto,
  ) {
    return this.recursosService.updateReserva(id, updateReservaDto);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Delete('reservas/:id')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  removeReserva(@Param('id') id: string) {
    return this.recursosService.removeReserva(id);
  }
}

