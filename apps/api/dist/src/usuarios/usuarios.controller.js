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
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const usuarios_service_1 = require("./usuarios.service");
const create_trainer_dto_1 = require("./dto/create-trainer.dto");
const update_trainer_dto_1 = require("./dto/update-trainer.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let UsuariosController = class UsuariosController {
    usuariosService;
    constructor(usuariosService) {
        this.usuariosService = usuariosService;
    }
    async me(req) {
        const { sub: userId, email, roles } = req.user;
        const usuario = await this.usuariosService.findOne(userId);
        return {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            roles,
            participanteId: usuario.participante?.id || null,
        };
    }
    findAll() {
        return this.usuariosService.findAll();
    }
    findOne(id) {
        return this.usuariosService.findOne(id);
    }
    findAllTrainers() {
        return this.usuariosService.findAllTrainers();
    }
    createTrainer(dto) {
        return this.usuariosService.createTrainer(dto);
    }
    updateTrainer(id, dto) {
        return this.usuariosService.updateTrainer(id, dto);
    }
    deleteTrainer(id) {
        return this.usuariosService.deleteTrainer(id);
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "me", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('trainers/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los usuarios con rol TRAINER' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de trainers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "findAllTrainers", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)('trainers'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo usuario con rol TRAINER' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trainer creado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El email ya está registrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trainer_dto_1.CreateTrainerDto]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "createTrainer", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Patch)('trainers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un usuario trainer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trainer actualizado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trainer no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_trainer_dto_1.UpdateTrainerDto]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "updateTrainer", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)('trainers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar un usuario trainer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trainer desactivado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trainer no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "deleteTrainer", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, swagger_1.ApiTags)('usuarios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService])
], UsuariosController);
//# sourceMappingURL=usuarios.controller.js.map