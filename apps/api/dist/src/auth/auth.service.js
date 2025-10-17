"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt_1 = require("bcrypt");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(nombre, email, password, rol) {
        const exists = await this.prisma.usuario.findUnique({ where: { email } });
        if (exists)
            throw new common_1.BadRequestException('El email ya está registrado');
        const passwordHash = await (0, bcrypt_1.hash)(password, 10);
        const usuario = await this.prisma.usuario.create({
            data: { nombre, email, passwordHash, estado: 'ACTIVO' },
        });
        const rolNombre = rol ?? 'ASSISTANT';
        const role = await this.prisma.rol.upsert({
            where: { nombre: rolNombre },
            update: {},
            create: { nombre: rolNombre },
        });
        await this.prisma.usuarioRol.upsert({
            where: { usuarioId_rolId: { usuarioId: usuario.id, rolId: role.id } },
            update: {},
            create: { usuarioId: usuario.id, rolId: role.id },
        });
        const token = await this.signToken(usuario.id, usuario.email, [rolNombre]);
        return { access_token: token };
    }
    async login(email, password) {
        const user = await this.prisma.usuario.findUnique({
            where: { email },
            include: { roles: { include: { rol: true } } },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const ok = await (0, bcrypt_1.compare)(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const roles = user.roles.map((r) => r.rol.nombre);
        const token = await this.signToken(user.id, user.email, roles);
        return { access_token: token };
    }
    async signToken(sub, email, roles) {
        const payload = { sub, email, roles };
        return this.jwt.signAsync(payload, { expiresIn: '8h' });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map