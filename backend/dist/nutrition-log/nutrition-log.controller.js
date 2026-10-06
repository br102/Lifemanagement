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
exports.NutritionLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const create_log_entry_dto_1 = require("./dto/create-log-entry.dto");
const log_from_meal_dto_1 = require("./dto/log-from-meal.dto");
const update_log_entry_dto_1 = require("./dto/update-log-entry.dto");
const nutrition_log_service_1 = require("./nutrition-log.service");
let NutritionLogController = class NutritionLogController {
    constructor(service) {
        this.service = service;
    }
    getDay(user, date) {
        return this.service.getDay(user.userId, date);
    }
    getRange(user, from, to) {
        return this.service.getRange(user.userId, from, to);
    }
    logFromMeal(user, dto) {
        return this.service.logFromMeal(user.userId, dto);
    }
    create(user, dto) {
        return this.service.createCustom(user.userId, dto);
    }
    update(user, id, dto) {
        return this.service.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.service.remove(user.userId, id);
    }
};
exports.NutritionLogController = NutritionLogController;
__decorate([
    (0, common_1.Get)('day/:date'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "getDay", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "getRange", null);
__decorate([
    (0, common_1.Post)('from-meal'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, log_from_meal_dto_1.LogFromMealDto]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "logFromMeal", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_log_entry_dto_1.CreateLogEntryDto]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_log_entry_dto_1.UpdateLogEntryDto]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NutritionLogController.prototype, "remove", null);
exports.NutritionLogController = NutritionLogController = __decorate([
    (0, swagger_1.ApiTags)('nutrition-log'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('nutrition-log'),
    __metadata("design:paramtypes", [nutrition_log_service_1.NutritionLogService])
], NutritionLogController);
//# sourceMappingURL=nutrition-log.controller.js.map