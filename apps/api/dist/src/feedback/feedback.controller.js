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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const feedback_service_1 = require("./feedback.service");
const create_feedback_dto_1 = require("./dto/create-feedback.dto");
const update_feedback_dto_1 = require("./dto/update-feedback.dto");
let FeedbackController = class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    create(dto) {
        return this.feedbackService.create(dto);
    }
    findAll(tallerId, participanteId, page, pageSize) {
        return this.feedbackService.findAll({
            tallerId,
            participanteId,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
    }
    resumen(tallerId) {
        return this.feedbackService.resumenPorTaller(tallerId);
    }
    findOne(id) {
        return this.feedbackService.findOne(id);
    }
    update(id, dto) {
        return this.feedbackService.update(id, dto);
    }
    remove(id) {
        return this.feedbackService.remove(id);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_feedback_dto_1.CreateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tallerId')),
    __param(1, (0, common_1.Query)('participanteId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('resumen/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "resumen", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_feedback_dto_1.UpdateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "remove", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, common_1.Controller)('feedback'),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map