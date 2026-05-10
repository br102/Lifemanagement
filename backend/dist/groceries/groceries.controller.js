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
exports.GroceriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const groceries_service_1 = require("./groceries.service");
let GroceriesController = class GroceriesController {
    constructor(groceries) {
        this.groceries = groceries;
    }
    getForWeek(user, weekStartDate) {
        return this.groceries.getByWeek(user.userId, weekStartDate);
    }
    generate(user, weekStartDate) {
        return this.groceries.generateFromWeekPlan(user.userId, weekStartDate);
    }
    toggle(user, listId, itemId) {
        return this.groceries.toggleItem(user.userId, listId, itemId);
    }
};
exports.GroceriesController = GroceriesController;
__decorate([
    (0, common_1.Get)(':weekStartDate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GroceriesController.prototype, "getForWeek", null);
__decorate([
    (0, common_1.Post)(':weekStartDate/generate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GroceriesController.prototype, "generate", null);
__decorate([
    (0, common_1.Patch)(':listId/items/:itemId/toggle'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('listId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], GroceriesController.prototype, "toggle", null);
exports.GroceriesController = GroceriesController = __decorate([
    (0, swagger_1.ApiTags)('groceries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('groceries'),
    __metadata("design:paramtypes", [groceries_service_1.GroceriesService])
], GroceriesController);
//# sourceMappingURL=groceries.controller.js.map