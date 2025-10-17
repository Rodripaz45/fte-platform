import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import type { Request as ExpressRequest } from 'express';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    me(req: ExpressRequest): {
        id: string;
        email: string;
        roles: string[];
    };
    create(createUsuarioDto: CreateUsuarioDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateUsuarioDto: UpdateUsuarioDto): string;
    remove(id: string): string;
}
