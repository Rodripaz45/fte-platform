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

  // === CRUD AUTO-GENERADO ===

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
