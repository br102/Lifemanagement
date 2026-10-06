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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const multer_exception_filter_1 = require("../common/filters/multer-exception.filter");
const supabase_image_storage_service_1 = require("../storage/supabase-image-storage.service");
const expenses_service_1 = require("./expenses.service");
const upload_receipt_dto_1 = require("./dto/upload-receipt.dto");
let ExpensesController = class ExpensesController {
    constructor(expensesService, imageStorage) {
        this.expensesService = expensesService;
        this.imageStorage = imageStorage;
    }
    async uploadImage(file) {
        const { objectPath } = await this.imageStorage.uploadReceiptImage(file);
        const { data } = (await this.imageStorage.getPublicUrl(objectPath)) || {};
        return { imageUrl: data?.publicUrl || '' };
    }
    async parseReceipt(user, dto) {
        return this.expensesService.parseReceipt(user.userId, dto.imageUrl);
    }
    async confirmReceipt(user, dto) {
        return this.expensesService.confirmReceipt(user.userId, dto);
    }
    async getReceipts(user) {
        return this.expensesService.getReceipts(user.userId);
    }
    async getIngredientPrices(user) {
        return this.expensesService.getIngredientPrices(user.userId);
    }
    async getMealCosts(user) {
        return this.expensesService.getMealCosts(user.userId);
    }
    async getGroceryEstimate(user, weekStartDate) {
        return this.expensesService.getGroceryEstimate(user.userId, weekStartDate);
    }
    async updateIngredient(user, id, dto) {
        return this.expensesService.updateIngredient(user.userId, id, dto);
    }
    async updateIngredientPrice(user, id, dto) {
        return this.expensesService.updateIngredientPrice(user.userId, id, dto);
    }
    async deleteIngredientPrice(user, id) {
        return this.expensesService.deleteIngredientPrice(user.userId, id);
    }
    async updateReceipt(user, id, dto) {
        return this.expensesService.updateReceipt(user.userId, id, dto);
    }
    async deleteReceipt(user, id) {
        return this.expensesService.deleteReceipt(user.userId, id);
    }
    async getMonthlySpending(user) {
        return this.expensesService.getMonthlySpending(user.userId, 6);
    }
    async getBudgets(user, month) {
        return this.expensesService.getBudgets(user.userId, month);
    }
    async upsertBudgets(user, month, dto) {
        return this.expensesService.upsertBudgets(user.userId, month, dto);
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)('receipts/upload-image'),
    (0, common_1.UseFilters)(multer_exception_filter_1.MulterExceptionFilter),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('receipts/parse'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_receipt_dto_1.ParseReceiptDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "parseReceipt", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_receipt_dto_1.ConfirmReceiptDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "confirmReceipt", null);
__decorate([
    (0, common_1.Get)('receipts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getReceipts", null);
__decorate([
    (0, common_1.Get)('ingredients/prices'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getIngredientPrices", null);
__decorate([
    (0, common_1.Get)('meals/costs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getMealCosts", null);
__decorate([
    (0, common_1.Get)('groceries/:weekStartDate/estimate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getGroceryEstimate", null);
__decorate([
    (0, common_1.Patch)('ingredients/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_receipt_dto_1.UpdateIngredientDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "updateIngredient", null);
__decorate([
    (0, common_1.Patch)('ingredients/prices/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_receipt_dto_1.UpdateIngredientPriceDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "updateIngredientPrice", null);
__decorate([
    (0, common_1.Delete)('ingredients/prices/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "deleteIngredientPrice", null);
__decorate([
    (0, common_1.Patch)('receipts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_receipt_dto_1.UpdateReceiptDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "updateReceipt", null);
__decorate([
    (0, common_1.Delete)('receipts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "deleteReceipt", null);
__decorate([
    (0, common_1.Get)('spending/monthly'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getMonthlySpending", null);
__decorate([
    (0, common_1.Get)('budgets/:month'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Put)('budgets/:month'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_receipt_dto_1.UpsertBudgetsDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "upsertBudgets", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, swagger_1.ApiTags)('expenses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService,
        supabase_image_storage_service_1.SupabaseImageStorageService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map