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
let TalleresController = class TalleresController {
    talleresService;
    constructor(talleresService) {
        this.talleresService = talleresService;
    }
    create(createTallereDto) {
        return this.talleresService.create(createTallereDto);
    }
    findAll() {
        return this.talleresService.findAll();
    }
    findOne(id) {
        return this.talleresService.findOne(+id);
    }
    update(id, updateTallereDto) {
        return this.talleresService.update(+id, updateTallereDto);
    }
    remove(id) {
        return this.talleresService.remove(+id);
    }
};
exports.TalleresController = TalleresController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tallere_dto_1.CreateTallereDto]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tallere_dto_1.UpdateTallereDto]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TalleresController.prototype, "remove", null);
exports.TalleresController = TalleresController = __decorate([
    (0, common_1.Controller)('talleres'),
    __metadata("design:paramtypes", [talleres_service_1.TalleresService])
], TalleresController);
//# sourceMappingURL=talleres.controller.js.map