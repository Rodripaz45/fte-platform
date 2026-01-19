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
exports.RecursosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
const recursos_service_1 = require("./recursos.service");
const create_sala_dto_1 = require("./dto/create-sala.dto");
const update_sala_dto_1 = require("./dto/update-sala.dto");
const create_reserva_sala_dto_1 = require("./dto/create-reserva-sala.dto");
const update_reserva_sala_dto_1 = require("./dto/update-reserva-sala.dto");
const verificar_disponibilidad_dto_1 = require("./dto/verificar-disponibilidad.dto");
let RecursosController = class RecursosController {
    recursosService;
    constructor(recursosService) {
        this.recursosService = recursosService;
    }
    createSala(createSalaDto) {
        return this.recursosService.createSala(createSalaDto);
    }
    findAllSalas(sede, activa) {
        return this.recursosService.findAllSalas(sede, activa === 'true' ? true : activa === 'false' ? false : undefined);
    }
    findOneSala(id) {
        return this.recursosService.findOneSala(id);
    }
    updateSala(id, updateSalaDto) {
        return this.recursosService.updateSala(id, updateSalaDto);
    }
    removeSala(id) {
        return this.recursosService.removeSala(id);
    }
    verificarDisponibilidad(dto) {
        return this.recursosService.verificarDisponibilidad(dto);
    }
    createReserva(createReservaDto) {
        return this.recursosService.createReserva(createReservaDto);
    }
    findAllReservas(salaId, fechaInicio, fechaFin) {
        return this.recursosService.findAllReservas(salaId, fechaInicio, fechaFin);
    }
    findOneReserva(id) {
        return this.recursosService.findOneReserva(id);
    }
    updateReserva(id, updateReservaDto) {
        return this.recursosService.updateReserva(id, updateReservaDto);
    }
    removeReserva(id) {
        return this.recursosService.removeReserva(id);
    }
};
exports.RecursosController = RecursosController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Post)('salas'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva sala' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sala_dto_1.CreateSalaDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "createSala", null);
__decorate([
    (0, common_1.Get)('salas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las salas' }),
    __param(0, (0, common_1.Query)('sede')),
    __param(1, (0, common_1.Query)('activa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "findAllSalas", null);
__decorate([
    (0, common_1.Get)('salas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una sala por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "findOneSala", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Patch)('salas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una sala' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sala_dto_1.UpdateSalaDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "updateSala", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR'),
    (0, common_1.Delete)('salas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una sala' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "removeSala", null);
__decorate([
    (0, common_1.Post)('reservas/verificar-disponibilidad'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar disponibilidad de una sala' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verificar_disponibilidad_dto_1.VerificarDisponibilidadDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "verificarDisponibilidad", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Post)('reservas'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva reserva de sala' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reserva_sala_dto_1.CreateReservaSalaDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "createReserva", null);
__decorate([
    (0, common_1.Get)('reservas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las reservas' }),
    __param(0, (0, common_1.Query)('salaId')),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "findAllReservas", null);
__decorate([
    (0, common_1.Get)('reservas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una reserva por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "findOneReserva", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Patch)('reservas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una reserva' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reserva_sala_dto_1.UpdateReservaSalaDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "updateReserva", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTOR', 'TRAINER'),
    (0, common_1.Delete)('reservas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar una reserva' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "removeReserva", null);
exports.RecursosController = RecursosController = __decorate([
    (0, swagger_1.ApiTags)('Recursos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recursos'),
    __metadata("design:paramtypes", [recursos_service_1.RecursosService])
], RecursosController);
//# sourceMappingURL=recursos.controller.js.map