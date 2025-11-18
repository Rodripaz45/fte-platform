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
exports.UnidadesEducativasController = void 0;
const common_1 = require("@nestjs/common");
const unidades_educativas_service_1 = require("./unidades-educativas.service");
const create_unidad_educativa_dto_1 = require("./dto/create-unidad-educativa.dto");
const update_unidad_educativa_dto_1 = require("./dto/update-unidad-educativa.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let UnidadesEducativasController = class UnidadesEducativasController {
    unidadesEducativasService;
    constructor(unidadesEducativasService) {
        this.unidadesEducativasService = unidadesEducativasService;
    }
    create(createDto) {
        return this.unidadesEducativasService.create(createDto);
    }
    findAll() {
        return this.unidadesEducativasService.findAll();
    }
    findOne(id) {
        return this.unidadesEducativasService.findOne(id);
    }
    update(id, updateDto) {
        return this.unidadesEducativasService.update(id, updateDto);
    }
    remove(id) {
        return this.unidadesEducativasService.remove(id);
    }
};
exports.UnidadesEducativasController = UnidadesEducativasController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_unidad_educativa_dto_1.CreateUnidadEducativaDto]),
    __metadata("design:returntype", void 0)
], UnidadesEducativasController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UnidadesEducativasController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UnidadesEducativasController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_unidad_educativa_dto_1.UpdateUnidadEducativaDto]),
    __metadata("design:returntype", void 0)
], UnidadesEducativasController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UnidadesEducativasController.prototype, "remove", null);
exports.UnidadesEducativasController = UnidadesEducativasController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('unidades-educativas'),
    __metadata("design:paramtypes", [unidades_educativas_service_1.UnidadesEducativasService])
], UnidadesEducativasController);
//# sourceMappingURL=unidades-educativas.controller.js.map