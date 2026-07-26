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
exports.MealsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const multer_exception_filter_1 = require("../common/filters/multer-exception.filter");
const create_meal_dto_1 = require("./dto/create-meal.dto");
const update_meal_dto_1 = require("./dto/update-meal.dto");
const ai_tools_dto_1 = require("./dto/ai-tools.dto");
const meals_service_1 = require("./meals.service");
const supabase_image_storage_service_1 = require("../storage/supabase-image-storage.service");
let MealsController = class MealsController {
    constructor(mealsService, imageStorage) {
        this.mealsService = mealsService;
        this.imageStorage = imageStorage;
    }
    async uploadImage(file) {
        const { publicUrl } = await this.imageStorage.uploadMealImage(file);
        return { imageUrl: publicUrl };
    }
    findAll(user, search, type) {
        return this.mealsService.findAll(user.userId, search, type);
    }
    findOne(user, id) {
        return this.mealsService.findById(user.userId, id);
    }
    create(user, dto) {
        return this.mealsService.create(user.userId, dto);
    }
    categorize(dto) {
        return this.mealsService.aiCategorize(dto.name, dto.ingredients);
    }
    nutrition(dto) {
        return this.mealsService.aiNutrition(dto.name, dto.ingredients);
    }
    update(user, id, dto) {
        return this.mealsService.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.mealsService.remove(user.userId, id);
    }
};
exports.MealsController = MealsController;
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseFilters)(multer_exception_filter_1.MulterExceptionFilter),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MealsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_meal_dto_1.CreateMealDto]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('ai/categorize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_tools_dto_1.AiCategorizeDto]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "categorize", null);
__decorate([
    (0, common_1.Post)('ai/nutrition'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_tools_dto_1.AiNutritionDto]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "nutrition", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_meal_dto_1.UpdateMealDto]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "remove", null);
exports.MealsController = MealsController = __decorate([
    (0, swagger_1.ApiTags)('meals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('meals'),
    __metadata("design:paramtypes", [meals_service_1.MealsService,
        supabase_image_storage_service_1.SupabaseImageStorageService])
], MealsController);
//# sourceMappingURL=meals.controller.js.map