"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalleresService = void 0;
const common_1 = require("@nestjs/common");
let TalleresService = class TalleresService {
    create(createTallereDto) {
        return 'This action adds a new tallere';
    }
    findAll() {
        return `This action returns all talleres`;
    }
    findOne(id) {
        return `This action returns a #${id} tallere`;
    }
    update(id, updateTallereDto) {
        return `This action updates a #${id} tallere`;
    }
    remove(id) {
        return `This action removes a #${id} tallere`;
    }
};
exports.TalleresService = TalleresService;
exports.TalleresService = TalleresService = __decorate([
    (0, common_1.Injectable)()
], TalleresService);
//# sourceMappingURL=talleres.service.js.map