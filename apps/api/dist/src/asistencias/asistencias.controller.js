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
exports.AsistenciasController = void 0;
const common_1 = require("@nestjs/common");
const asistencias_service_1 = require("./asistencias.service");
const tomar_asistencia_dto_1 = require("./dto/tomar-asistencia.dto");
const create_asistencia_dto_1 = require("./dto/create-asistencia.dto");
const update_asistencia_dto_1 = require("./dto/update-asistencia.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
let AsistenciasController = class AsistenciasController {
    asistenciasService;
    constructor(asistenciasService) {
        this.asistenciasService = asistenciasService;
    }
    tomar(dto) {
        return this.asistenciasService.tomar(dto);
    }
    create(dto) {
        return this.asistenciasService.create(dto);
    }
    findAll(sesionId) {
        return this.asistenciasService.findAll({ sesionId });
    }
    resumen(sesionId) {
        return this.asistenciasService.resumenPorSesion(sesionId);
    }
    findOne(id) {
        return this.asistenciasService.findOne(id);
    }
    update(id, dto) {
        return this.asistenciasService.update(id, dto);
    }
    remove(id) {
        return this.asistenciasService.remove(id);
    }
};
exports.AsistenciasController = AsistenciasController;
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Post)('tomar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tomar_asistencia_dto_1.TomarAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "tomar", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asistencia_dto_1.CreateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sesionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Get)('resumen'),
    __param(0, (0, common_1.Query)('sesionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "resumen", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_asistencia_dto_1.UpdateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "remove", null);
exports.AsistenciasController = AsistenciasController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('asistencias'),
    __metadata("design:paramtypes", [asistencias_service_1.AsistenciasService])
], AsistenciasController);
//# sourceMappingURL=asistencias.controller.js.map