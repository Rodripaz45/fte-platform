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
exports.CvsController = void 0;
const common_1 = require("@nestjs/common");
const cvs_service_1 = require("./cvs.service");
const create_cv_dto_1 = require("./dto/create-cv.dto");
const update_cv_dto_1 = require("./dto/update-cv.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let CvsController = class CvsController {
    cvsService;
    constructor(cvsService) {
        this.cvsService = cvsService;
    }
    create(dto) {
        return this.cvsService.create(dto);
    }
    findAll(participanteId) {
        return this.cvsService.findAll(participanteId ? { participanteId } : undefined);
    }
    findOne(id) {
        return this.cvsService.findOne(id);
    }
    update(id, dto) {
        return this.cvsService.update(id, dto);
    }
    remove(id) {
        return this.cvsService.remove(id);
    }
};
exports.CvsController = CvsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear CV. Extrae texto automáticamente del PDF en url' }),
    (0, swagger_1.ApiBody)({ type: create_cv_dto_1.CreateCvDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cv_dto_1.CreateCvDto]),
    __metadata("design:returntype", void 0)
], CvsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar CVs (opcional: por participanteId)' }),
    (0, swagger_1.ApiQuery)({ name: 'participanteId', required: false }),
    __param(0, (0, common_1.Query)('participanteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CvsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un CV por id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CvsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un CV (url, version, texto)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: update_cv_dto_1.UpdateCvDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cv_dto_1.UpdateCvDto]),
    __metadata("design:returntype", void 0)
], CvsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un CV por id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CvsController.prototype, "remove", null);
exports.CvsController = CvsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiTags)('CVs'),
    (0, common_1.Controller)('cvs'),
    __metadata("design:paramtypes", [cvs_service_1.CvsService])
], CvsController);
//# sourceMappingURL=cvs.controller.js.map