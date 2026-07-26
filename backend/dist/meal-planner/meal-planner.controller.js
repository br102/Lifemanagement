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
exports.MealPlannerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const upsert_slot_dto_1 = require("./dto/upsert-slot.dto");
const meal_planner_service_1 = require("./meal-planner.service");
let MealPlannerController = class MealPlannerController {
    constructor(planner) {
        this.planner = planner;
    }
    getMonth(user, month) {
        return this.planner.getMonth(user.userId, month);
    }
    getWeek(user, weekStartDate) {
        return this.planner.getWeek(user.userId, weekStartDate);
    }
    setSlot(user, weekStartDate, dto) {
        return this.planner.upsertSlot(user.userId, weekStartDate, dto);
    }
    aiGenerate(user, weekStartDate) {
        return this.planner.aiGenerate(user.userId, weekStartDate);
    }
};
exports.MealPlannerController = MealPlannerController;
__decorate([
    (0, common_1.Get)('month/:month'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MealPlannerController.prototype, "getMonth", null);
__decorate([
    (0, common_1.Get)('week/:weekStartDate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MealPlannerController.prototype, "getWeek", null);
__decorate([
    (0, common_1.Post)('week/:weekStartDate/slot'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upsert_slot_dto_1.UpsertSlotDto]),
    __metadata("design:returntype", void 0)
], MealPlannerController.prototype, "setSlot", null);
__decorate([
    (0, common_1.Post)('week/:weekStartDate/ai-generate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MealPlannerController.prototype, "aiGenerate", null);
exports.MealPlannerController = MealPlannerController = __decorate([
    (0, swagger_1.ApiTags)('meal-planner'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('planner'),
    __metadata("design:paramtypes", [meal_planner_service_1.MealPlannerService])
], MealPlannerController);
//# sourceMappingURL=meal-planner.controller.js.map