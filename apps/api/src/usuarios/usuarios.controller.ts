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

@ApiTags('usuarios') // para agrupar en Swagger
@ApiBearerAuth() // habilita el botón Authorize con Bearer token
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // === NUEVO ENDPOINT PROTEGIDO ===
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { userId: string; email: string; roles: string[] };
    };
    // `req.user` viene de JwtStrategy.validate()
    const { userId, email, roles } = (req as AuthenticatedRequest).user;
    return { id: userId, email, roles };
  }


  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

}
