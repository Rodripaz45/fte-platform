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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesionesController = void 0;
const common_1 = require("@nestjs/common");
const sesiones_service_1 = require("./sesiones.service");
const create_sesion_dto_1 = require("./dto/create-sesion.dto");
const update_sesion_dto_1 = require("./dto/update-sesion.dto");
const generar_qr_dto_1 = require("./dto/generar-qr.dto");
const validar_qr_dto_1 = require("./dto/validar-qr.dto");
const create_sesiones_recurrentes_dto_1 = require("./dto/create-sesiones-recurrentes.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let SesionesController = class SesionesController {
    sesionesService;
    prisma;
    constructor(sesionesService, prisma) {
        this.sesionesService = sesionesService;
        this.prisma = prisma;
    }
    create(dto) {
        return this.sesionesService.create(dto);
    }
    createRecurrente(dto) {
        return this.sesionesService.createRecurrente(dto);
    }
    findAll(tallerId, page, pageSize) {
        return this.sesionesService.findAll({
            tallerId,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
    }
    async getMisSesiones(req) {
        const { sub: userId } = req.user;
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: userId },
            include: { participante: true },
        });
        if (!usuario?.participante) {
            return [];
        }
        return this.sesionesService.findByParticipante(usuario.participante.id);
    }
    findOne(id) {
        return this.sesionesService.findOne(id);
    }
    update(id, dto) {
        return this.sesionesService.update(id, dto);
    }
    remove(id) {
        return this.sesionesService.remove(id);
    }
    generarQR(dto) {
        return this.sesionesService.generarQR(dto);
    }
    validarQR(dto) {
        return this.sesionesService.validarQR(dto);
    }
    getSesionByQR(codigoQR) {
        return this.sesionesService.validarQR({ codigoQR });
    }
    regenerarQR(sesionId, duracionMinutos) {
        return this.sesionesService.regenerarQR(sesionId, duracionMinutos);
    }
    invalidarQR(sesionId) {
        return this.sesionesService.invalidarQR(sesionId);
    }
};
exports.SesionesController = SesionesController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sesion_dto_1.CreateSesionDto]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)('recurrencia'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear sesiones recurrentes en un rango de fechas y días' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sesiones_recurrentes_dto_1.CreateSesionesRecurrentesDto]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "createRecurrente", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tallerId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('PARTICIPANTE'),
    (0, common_1.Get)('mis-sesiones'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener las sesiones del participante autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de sesiones del participante' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SesionesController.prototype, "getMisSesiones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sesion_dto_1.UpdateSesionDto]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)('generar-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar código QR para una sesión' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Código QR generado exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generar_qr_dto_1.GenerarQRDto]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "generarQR", null);
__decorate([
    (0, common_1.Post)('validar-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Validar código QR de una sesión' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Código QR válido' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Código QR no válido' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validar_qr_dto_1.ValidarQRDto]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "validarQR", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('qr/:codigoQR'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información de sesión por código QR (público)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información de la sesión' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Código QR no válido' }),
    __param(0, (0, common_1.Param)('codigoQR')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "getSesionByQR", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)(':id/regenerar-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerar código QR de una sesión' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Código QR regenerado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('duracionMinutos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "regenerarQR", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)(':id/invalidar-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Invalidar código QR de una sesión' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Código QR invalidado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SesionesController.prototype, "invalidarQR", null);
exports.SesionesController = SesionesController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sesiones'),
    __metadata("design:paramtypes", [sesiones_service_1.SesionesService,
        prisma_service_1.PrismaService])
], SesionesController);
//# sourceMappingURL=sesiones.controller.js.map