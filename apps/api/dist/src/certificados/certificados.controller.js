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
exports.CertificadosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const certificados_service_1 = require("./certificados.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
let CertificadosController = class CertificadosController {
    certificadosService;
    constructor(certificadosService) {
        this.certificadosService = certificadosService;
    }
    async getMisCertificados(req) {
        const { sub: userId } = req.user;
        return this.certificadosService.findByUsuarioId(userId);
    }
    async emitirCertificado(tallerId, participanteId, req) {
        const { sub: userId } = req.user;
        return this.certificadosService.emitirCertificado(tallerId, participanteId, userId);
    }
    async emitirCertificadosMasivo(tallerId) {
        return this.certificadosService.emitirCertificadosAutomaticos(tallerId);
    }
    async getAllCertificados() {
        return this.certificadosService.findAll();
    }
    async getCertificado(id) {
        return this.certificadosService.findOne(id);
    }
    async verificarCertificado(codigo) {
        return this.certificadosService.verificarPorCodigo(codigo);
    }
    async reenviarEmail(id) {
        await this.certificadosService.reenviarPorEmail(id);
        return { message: 'Certificado reenviado por email exitosamente' };
    }
    async regenerarCertificado(id, req) {
        const { sub: userId } = req.user;
        const certificado = await this.certificadosService.regenerarYReenviar(id, userId);
        return {
            message: 'Certificado regenerado y reenviado exitosamente',
            certificado,
        };
    }
};
exports.CertificadosController = CertificadosController;
__decorate([
    (0, roles_decorator_1.Roles)('PARTICIPANTE'),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis certificados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de certificados del participante' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "getMisCertificados", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)('emitir/:tallerId/:participanteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Emitir certificado manualmente para un participante' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Certificado emitido exitosamente' }),
    __param(0, (0, common_1.Param)('tallerId')),
    __param(1, (0, common_1.Param)('participanteId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "emitirCertificado", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)('emitir-masivo/:tallerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Emitir certificados automáticamente para todos los elegibles de un taller' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen de certificados emitidos' }),
    __param(0, (0, common_1.Param)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "emitirCertificadosMasivo", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los certificados (solo admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de todos los certificados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "getAllCertificados", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER', 'PARTICIPANTE'),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un certificado por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certificado encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "getCertificado", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verificar/:codigo'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar autenticidad de un certificado por código (público)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certificado verificado' }),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "verificarCertificado", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER', 'PARTICIPANTE'),
    (0, common_1.Post)(':id/reenviar-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Reenviar certificado por email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email reenviado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "reenviarEmail", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)(':id/regenerar'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerar y reenviar certificado (solo admin, permite regenerar aunque ya exista)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certificado regenerado y reenviado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CertificadosController.prototype, "regenerarCertificado", null);
exports.CertificadosController = CertificadosController = __decorate([
    (0, swagger_1.ApiTags)('Certificados'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('certificados'),
    __metadata("design:paramtypes", [certificados_service_1.CertificadosService])
], CertificadosController);
//# sourceMappingURL=certificados.controller.js.map