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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
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

}
