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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('usuarios') // para agrupar en Swagger
@ApiBearerAuth() // habilita el botón Authorize con Bearer token
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // === NUEVO ENDPOINT PROTEGIDO ===
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    // `req.user` viene de JwtStrategy.validate()
    const { sub: userId, email, roles } = (req as AuthenticatedRequest).user;
    
    // Obtener información completa del usuario incluyendo participante
    const usuario = await this.usuariosService.findOne(userId);
    
    return { 
      id: usuario.id, 
      email: usuario.email, 
      nombre: usuario.nombre,
      roles,
      participanteId: usuario.participante?.id || null,
    };
  }


  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  // === ENDPOINTS PARA GESTIONAR TRAINERS ===
  @Roles('ADMIN')
  @Get('trainers/all')
  @ApiOperation({ summary: 'Obtener todos los usuarios con rol TRAINER' })
  @ApiResponse({ status: 200, description: 'Lista de trainers' })
  findAllTrainers() {
    return this.usuariosService.findAllTrainers();
  }

  @Roles('ADMIN')
  @Post('trainers')
  @ApiOperation({ summary: 'Crear un nuevo usuario con rol TRAINER' })
  @ApiResponse({ status: 201, description: 'Trainer creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  createTrainer(@Body() dto: CreateTrainerDto) {
    return this.usuariosService.createTrainer(dto);
  }

  @Roles('ADMIN')
  @Patch('trainers/:id')
  @ApiOperation({ summary: 'Actualizar un usuario trainer' })
  @ApiResponse({ status: 200, description: 'Trainer actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trainer no encontrado' })
  updateTrainer(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.usuariosService.updateTrainer(id, dto);
  }

  @Roles('ADMIN')
  @Delete('trainers/:id')
  @ApiOperation({ summary: 'Desactivar un usuario trainer' })
  @ApiResponse({ status: 200, description: 'Trainer desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trainer no encontrado' })
  deleteTrainer(@Param('id') id: string) {
    return this.usuariosService.deleteTrainer(id);
  }
}
