"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsuariosService = class UsuariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.usuario.findMany({
            include: {
                roles: { include: { rol: true } },
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: {
                roles: { include: { rol: true } },
                participante: true,
            },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }
    async findAllTrainers() {
        const rolTrainer = await this.prisma.rol.findUnique({
            where: { nombre: 'TRAINER' },
        });
        if (!rolTrainer) {
            return [];
        }
        const usuariosTrainer = await this.prisma.usuarioRol.findMany({
            where: { rolId: rolTrainer.id },
            include: {
                usuario: {
                    include: {
                        roles: { include: { rol: true } },
                    },
                },
            },
            orderBy: { usuario: { creadoEn: 'desc' } },
        });
        return usuariosTrainer.map(ur => ({
            ...ur.usuario,
            roles: ur.usuario.roles.map(r => r.rol),
        }));
    }
    async createTrainer(dto) {
        const existingUser = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const usuario = await this.prisma.usuario.create({
            data: {
                nombre: dto.nombre,
                email: dto.email,
                passwordHash,
                estado: dto.estado || 'ACTIVO',
            },
        });
        const rolTrainer = await this.prisma.rol.upsert({
            where: { nombre: 'TRAINER' },
            update: {},
            create: { nombre: 'TRAINER' },
        });
        await this.prisma.usuarioRol.create({
            data: {
                usuarioId: usuario.id,
                rolId: rolTrainer.id,
            },
        });
        return this.findOne(usuario.id);
    }
    async updateTrainer(id, dto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: { roles: { include: { rol: true } } },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = usuario.roles.some(ur => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario no tiene rol TRAINER');
        }
        if (dto.email && dto.email !== usuario.email) {
            const existingUser = await this.prisma.usuario.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
        }
        const updateData = {};
        if (dto.nombre)
            updateData.nombre = dto.nombre;
        if (dto.email)
            updateData.email = dto.email;
        if (dto.estado)
            updateData.estado = dto.estado;
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        await this.prisma.usuario.update({
            where: { id },
            data: updateData,
        });
        return this.findOne(id);
    }
    async deleteTrainer(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: { roles: { include: { rol: true } } },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = usuario.roles.some(ur => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario no tiene rol TRAINER');
        }
        await this.prisma.usuario.update({
            where: { id },
            data: { estado: 'INACTIVO' },
        });
        return { message: 'Trainer desactivado correctamente' };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map