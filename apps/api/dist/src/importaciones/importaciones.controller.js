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
exports.ImportacionesController = void 0;
const common_1 = require("@nestjs/common");
const importaciones_service_1 = require("./importaciones.service");
const importar_lista_dto_1 = require("./dto/importar-lista.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let ImportacionesController = class ImportacionesController {
    importacionesService;
    constructor(importacionesService) {
        this.importacionesService = importacionesService;
    }
    importarLista(dto) {
        return this.importacionesService.importarLista(dto);
    }
    obtenerLista(tallerId) {
        return this.importacionesService.obtenerListaParticipantes(tallerId);
    }
    eliminarParticipante(id) {
        return this.importacionesService.eliminarParticipante(id);
    }
};
exports.ImportacionesController = ImportacionesController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Post)('lista'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar lista de participantes desde CSV/Excel' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lista importada exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [importar_lista_dto_1.ImportarListaDto]),
    __metadata("design:returntype", void 0)
], ImportacionesController.prototype, "importarLista", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('lista/:tallerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de participantes de un taller UE' }),
    __param(0, (0, common_1.Param)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImportacionesController.prototype, "obtenerLista", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Delete)('participante/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un participante de la lista' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImportacionesController.prototype, "eliminarParticipante", null);
exports.ImportacionesController = ImportacionesController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('importaciones'),
    __metadata("design:paramtypes", [importaciones_service_1.ImportacionesService])
], ImportacionesController);
//# sourceMappingURL=importaciones.controller.js.map