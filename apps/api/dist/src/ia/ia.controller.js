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
exports.IaController = void 0;
const common_1 = require("@nestjs/common");
const ia_service_1 = require("./ia.service");
const analyze_job_dto_1 = require("./dto/analyze-job.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const public_decorator_1 = require("../auth/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let IaController = class IaController {
    iaService;
    constructor(iaService) {
        this.iaService = iaService;
    }
    async healthCheck() {
        return this.iaService.healthCheck();
    }
    async reprocesar(participanteId) {
        return this.iaService.analyzeByParticipantId(participanteId);
    }
    async analyzeJob(dto) {
        return this.iaService.analyzeJob(dto);
    }
};
exports.IaController = IaController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check del microservicio IA' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IaController.prototype, "healthCheck", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reprocesar/:participanteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reconstruye desde BD, analiza y persiste competencias' }),
    (0, swagger_1.ApiParam)({ name: 'participanteId', type: String }),
    __param(0, (0, common_1.Param)('participanteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IaController.prototype, "reprocesar", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('analyze/job'),
    (0, swagger_1.ApiOperation)({ summary: 'Analiza competencias requeridas para una oferta/puesto' }),
    (0, swagger_1.ApiBody)({ type: analyze_job_dto_1.AnalyzeJobDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_job_dto_1.AnalyzeJobDto]),
    __metadata("design:returntype", Promise)
], IaController.prototype, "analyzeJob", null);
exports.IaController = IaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiTags)('IA'),
    (0, common_1.Controller)('ia'),
    __metadata("design:paramtypes", [ia_service_1.IaService])
], IaController);
//# sourceMappingURL=ia.controller.js.map