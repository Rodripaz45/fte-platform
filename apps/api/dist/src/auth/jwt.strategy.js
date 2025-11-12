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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    logger = new common_1.Logger(JwtStrategy_1.name);
    userCache = new Map();
    CACHE_TTL = 5 * 60 * 1000;
    constructor(prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        const userId = payload.sub;
        const now = Date.now();
        const cached = this.userCache.get(userId);
        if (cached && (now - cached.cachedAt) < this.CACHE_TTL) {
            return {
                sub: cached.id,
                email: cached.email,
                nombre: cached.nombre,
                roles: cached.roles,
                estado: cached.estado,
            };
        }
        try {
            const user = await this.prisma.usuario.findUnique({
                where: { id: userId },
                include: { roles: { include: { rol: true } } },
            });
            if (!user) {
                throw new common_1.UnauthorizedException();
            }
            const roles = user.roles.map((ur) => String(ur.rol.nombre).toUpperCase());
            const userData = {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                roles,
                estado: user.estado,
                cachedAt: now,
            };
            this.userCache.set(userId, userData);
            if (this.userCache.size > 100) {
                this.cleanExpiredCache();
            }
            return {
                sub: userData.id,
                email: userData.email,
                nombre: userData.nombre,
                roles: userData.roles,
                estado: userData.estado,
            };
        }
        catch (error) {
            this.logger.error(`Error validating user ${userId}:`, error);
            throw new common_1.UnauthorizedException();
        }
    }
    cleanExpiredCache() {
        const now = Date.now();
        for (const [userId, user] of this.userCache.entries()) {
            if (now - user.cachedAt > this.CACHE_TTL) {
                this.userCache.delete(userId);
            }
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map