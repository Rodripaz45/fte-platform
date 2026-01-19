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
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { VerificarDisponibilidadTrainerDto } from './dto/verificar-disponibilidad-trainer.dto';

@ApiTags('Disponibilidad')
@ApiBearerAuth()
@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Post('verificar')
  @ApiOperation({ summary: 'Verificar disponibilidad de un trainer' })
  verificarDisponibilidad(@Body() dto: VerificarDisponibilidadTrainerDto) {
    return this.disponibilidadService.verificarDisponibilidad(dto);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Post()
  @ApiOperation({ summary: 'Crear un registro de disponibilidad' })
  create(@Body() createDisponibilidadDto: CreateDisponibilidadDto) {
    return this.disponibilidadService.create(createDisponibilidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las disponibilidades' })
  findAll(
    @Query('trainerId') trainerId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.disponibilidadService.findAll(trainerId, fechaInicio, fechaFin);
  }

  @Get('trainers/:trainerId/carga-trabajo')
  @ApiOperation({ summary: 'Obtener carga de trabajo de un trainer' })
  obtenerCargaTrabajo(
    @Param('trainerId') trainerId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.disponibilidadService.obtenerCargaTrabajo(
      trainerId,
      fechaInicio,
      fechaFin,
    );
  }

  @Get('sugerir-trainers')
  @ApiOperation({ summary: 'Sugerir trainers disponibles para un horario' })
  sugerirTrainersDisponibles(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.disponibilidadService.sugerirTrainersDisponibles(
      fechaInicio,
      fechaFin,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una disponibilidad por ID' })
  findOne(@Param('id') id: string) {
    return this.disponibilidadService.findOne(id);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una disponibilidad' })
  update(
    @Param('id') id: string,
    @Body() updateDisponibilidadDto: UpdateDisponibilidadDto,
  ) {
    return this.disponibilidadService.update(id, updateDisponibilidadDto);
  }

  @Roles('ADMIN', 'DIRECTOR', 'TRAINER')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una disponibilidad' })
  remove(@Param('id') id: string) {
    return this.disponibilidadService.remove(id);
  }
}

