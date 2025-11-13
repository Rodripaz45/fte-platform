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
exports.NotificacionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notificaciones_service_1 = require("./notificaciones.service");
const create_notificacion_dto_1 = require("./dto/create-notificacion.dto");
const update_notificacion_dto_1 = require("./dto/update-notificacion.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let NotificacionesController = class NotificacionesController {
    notificacionesService;
    constructor(notificacionesService) {
        this.notificacionesService = notificacionesService;
    }
    async getMisNotificaciones(req, soloNoLeidas, limit) {
        const { sub: userId } = req.user;
        return this.notificacionesService.findByUsuario(userId, {
            soloNoLeidas: soloNoLeidas === 'true',
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async countNoLeidas(req) {
        const { sub: userId } = req.user;
        const count = await this.notificacionesService.countNoLeidas(userId);
        return { count };
    }
    async marcarTodasComoLeidas(req) {
        const { sub: userId } = req.user;
        return this.notificacionesService.marcarTodasComoLeidas(userId);
    }
    findOne(id) {
        return this.notificacionesService.findOne(id);
    }
    marcarComoLeida(id) {
        return this.notificacionesService.marcarComoLeida(id);
    }
    update(id, dto) {
        return this.notificacionesService.update(id, dto);
    }
    remove(id) {
        return this.notificacionesService.remove(id);
    }
    create(dto) {
        return this.notificacionesService.create(dto);
    }
};
exports.NotificacionesController = NotificacionesController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis notificaciones' }),
    (0, swagger_1.ApiQuery)({ name: 'soloNoLeidas', required: false, type: Boolean, description: 'Solo mostrar no leídas' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de notificaciones' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('soloNoLeidas')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificacionesController.prototype, "getMisNotificaciones", null);
__decorate([
    (0, common_1.Get)('me/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Contar notificaciones no leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cantidad de notificaciones no leídas' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificacionesController.prototype, "countNoLeidas", null);
__decorate([
    (0, common_1.Patch)('me/marcar-todas-leidas'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas mis notificaciones como leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificaciones marcadas como leídas' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificacionesController.prototype, "marcarTodasComoLeidas", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una notificación por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/leida'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar una notificación como leída' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación marcada como leída' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "marcarComoLeida", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una notificación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación actualizada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_notificacion_dto_1.UpdateNotificacionDto]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una notificación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación eliminada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una notificación (solo ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notificación creada' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notificacion_dto_1.CreateNotificacionDto]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "create", null);
exports.NotificacionesController = NotificacionesController = __decorate([
    (0, swagger_1.ApiTags)('notificaciones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notificaciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notificaciones_service_1.NotificacionesService])
], NotificacionesController);
//# sourceMappingURL=notificaciones.controller.js.map