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
exports.DisponibilidadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
const disponibilidad_service_1 = require("./disponibilidad.service");
const create_disponibilidad_dto_1 = require("./dto/create-disponibilidad.dto");
const update_disponibilidad_dto_1 = require("./dto/update-disponibilidad.dto");
const verificar_disponibilidad_trainer_dto_1 = require("./dto/verificar-disponibilidad-trainer.dto");
let DisponibilidadController = class DisponibilidadController {
    disponibilidadService;
    constructor(disponibilidadService) {
        this.disponibilidadService = disponibilidadService;
    }
    verificarDisponibilidad(dto) {
        return this.disponibilidadService.verificarDisponibilidad(dto);
    }
    create(createDisponibilidadDto) {
        return this.disponibilidadService.create(createDisponibilidadDto);
    }
    findAll(trainerId, fechaInicio, fechaFin) {
        return this.disponibilidadService.findAll(trainerId, fechaInicio, fechaFin);
    }
    obtenerCargaTrabajo(trainerId, fechaInicio, fechaFin) {
        return this.disponibilidadService.obtenerCargaTrabajo(trainerId, fechaInicio, fechaFin);
    }
    sugerirTrainersDisponibles(fechaInicio, fechaFin) {
        return this.disponibilidadService.sugerirTrainersDisponibles(fechaInicio, fechaFin);
    }
    findOne(id) {
        return this.disponibilidadService.findOne(id);
    }
    update(id, updateDisponibilidadDto) {
        return this.disponibilidadService.update(id, updateDisponibilidadDto);
    }
    remove(id) {
        return this.disponibilidadService.remove(id);
    }
};
exports.DisponibilidadController = DisponibilidadController;
__decorate([
    (0, common_1.Post)('verificar'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar disponibilidad de un trainer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verificar_disponibilidad_trainer_dto_1.VerificarDisponibilidadTrainerDto]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "verificarDisponibilidad", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un registro de disponibilidad' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_disponibilidad_dto_1.CreateDisponibilidadDto]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las disponibilidades' }),
    __param(0, (0, common_1.Query)('trainerId')),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('trainers/:trainerId/carga-trabajo'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener carga de trabajo de un trainer' }),
    __param(0, (0, common_1.Param)('trainerId')),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "obtenerCargaTrabajo", null);
__decorate([
    (0, common_1.Get)('sugerir-trainers'),
    (0, swagger_1.ApiOperation)({ summary: 'Sugerir trainers disponibles para un horario' }),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "sugerirTrainersDisponibles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una disponibilidad por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una disponibilidad' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_disponibilidad_dto_1.UpdateDisponibilidadDto]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una disponibilidad' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisponibilidadController.prototype, "remove", null);
exports.DisponibilidadController = DisponibilidadController = __decorate([
    (0, swagger_1.ApiTags)('Disponibilidad'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('disponibilidad'),
    __metadata("design:paramtypes", [disponibilidad_service_1.DisponibilidadService])
], DisponibilidadController);
//# sourceMappingURL=disponibilidad.controller.js.map