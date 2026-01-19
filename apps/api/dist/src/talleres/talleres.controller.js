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
exports.TalleresController = void 0;
const common_1 = require("@nestjs/common");
const talleres_service_1 = require("./talleres.service");
const create_tallere_dto_1 = require("./dto/create-tallere.dto");
const update_tallere_dto_1 = require("./dto/update-tallere.dto");
const aprobar_taller_dto_1 = require("./dto/aprobar-taller.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let TalleresController = class TalleresController {
    talleresService;
    constructor(talleresService) {
        this.talleresService = talleresService;
    }
    create(createTallereDto) {
        return this.talleresService.create(createTallereDto);
    }
    findAll(req) {
        const user = req.user;
        if (user.roles.includes('TRAINER')) {
            return this.talleresService.findAllByTrainerId(user.sub);
        }
        return this.talleresService.findAll();
    }
    findOne(id) {
        return this.talleresService.findOne(id);
    }
    update(id, updateTallereDto) {
        return this.talleresService.update(id, updateTallereDto);
    }
    remove(id) {
        return this.talleresService.remove(id);
    }
    publicar(id) {
        return this.talleresService.publicar(id);
    }
    cerrar(id) {
        return this.talleresService.cerrar(id);
    }
    finalizar(id) {
        return this.talleresService.finalizar(id);
    }
    asignarTrainer(id, trainerId) {
        return this.talleresService.asignarTrainer(id, trainerId);
    }
    obtenerPendientesAprobacion() {
        return this.talleresService.obtenerPendientesAprobacion();
    }
    aprobarTaller(id, dto, req) {
        return this.talleresService.aprobarTaller(id, req.user.sub, dto);
    }
    enviarARevision(id) {
        return this.talleresService.enviarARevision(id);
    }
    obtenerEstadisticasTrainer(trainerId, req) {
        if (req.user.roles.includes('TRAINER') && req.user.sub !== trainerId) {
            throw new common_1.BadRequestException('Solo puedes ver tus propias estadísticas');
        }
        return this.talleresService.obtenerEstadisticasTrainer(trainerId);
    }
    obtenerMisEstadisticas(req) {
        return this.talleresService.obtenerEstadisticasTrainer(req.user.sub);
    }
};
exports.TalleresController = TalleresController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tallere_dto_1.CreateTallereDto]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tallere_dto_1.UpdateTallereDto]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)(':id/publicar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "publicar", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)(':id/cerrar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "cerrar", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Post)(':id/finalizar'),
    (0, swagger_1.ApiOperation)({ summary: 'Finalizar taller y generar certificados automáticamente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Taller finalizado y certificados generados' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "finalizar", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Post)(':id/asignar-trainer'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar un trainer a un taller (solo Director/Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trainer asignado correctamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('trainerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "asignarTrainer", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Get)('pendientes-aprobacion'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener talleres pendientes de aprobación (solo Director/Admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "obtenerPendientesAprobacion", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Post)(':id/aprobar'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprobar, rechazar o enviar a revisión un taller (solo Director/Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Taller aprobado/rechazado correctamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, aprobar_taller_dto_1.AprobarTallerDto, Object]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "aprobarTaller", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER'),
    (0, common_1.Post)(':id/enviar-revision'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar taller a revisión (solo Trainer)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Taller enviado a revisión' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "enviarARevision", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN', 'DIRECTOR'),
    (0, common_1.Get)('estadisticas/:trainerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de un trainer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas del trainer' }),
    __param(0, (0, common_1.Param)('trainerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "obtenerEstadisticasTrainer", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER'),
    (0, common_1.Get)('mis-estadisticas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis estadísticas (solo Trainer)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas del trainer autenticado' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "obtenerMisEstadisticas", null);
exports.TalleresController = TalleresController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('talleres'),
    __metadata("design:paramtypes", [talleres_service_1.TalleresService])
], TalleresController);
//# sourceMappingURL=talleres.controller.js.map