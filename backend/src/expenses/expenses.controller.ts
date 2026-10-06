import { Body, Controller, Get, Post, Patch, Put, Delete, UploadedFile, UseFilters, UseInterceptors, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { SupabaseImageStorageService } from '../storage/supabase-image-storage.service';
import { ExpensesService } from './expenses.service';
import { ConfirmReceiptDto, ParseReceiptDto, UpdateIngredientDto, UpdateIngredientPriceDto, UpdateReceiptDto, UpsertBudgetsDto } from './dto/upload-receipt.dto';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly imageStorage: SupabaseImageStorageService,
  ) {}

  @Post('receipts/upload-image')
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedImageFile) {
    const { objectPath } = await this.imageStorage.uploadReceiptImage(file);
    const { data } = (await this.imageStorage.getPublicUrl(objectPath)) || {};
    return { imageUrl: data?.publicUrl || '' };
  }

  @Post('receipts/parse')
  async parseReceipt(@CurrentUser() user: { userId: string }, @Body() dto: ParseReceiptDto) {
    return this.expensesService.parseReceipt(user.userId, dto.imageUrl);
  }

  @Post('receipts')
  async confirmReceipt(@CurrentUser() user: { userId: string }, @Body() dto: ConfirmReceiptDto) {
    return this.expensesService.confirmReceipt(user.userId, dto);
  }

  @Get('receipts')
  async getReceipts(@CurrentUser() user: { userId: string }) {
    return this.expensesService.getReceipts(user.userId);
  }

  @Get('ingredients/prices')
  async getIngredientPrices(@CurrentUser() user: { userId: string }) {
    return this.expensesService.getIngredientPrices(user.userId);
  }

  @Get('meals/costs')
  async getMealCosts(@CurrentUser() user: { userId: string }) {
    return this.expensesService.getMealCosts(user.userId);
  }

  @Get('groceries/:weekStartDate/estimate')
  async getGroceryEstimate(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string) {
    return this.expensesService.getGroceryEstimate(user.userId, weekStartDate);
  }

  @Patch('ingredients/:id')
  async updateIngredient(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateIngredientDto) {
    return this.expensesService.updateIngredient(user.userId, id, dto);
  }

  @Patch('ingredients/prices/:id')
  async updateIngredientPrice(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateIngredientPriceDto) {
    return this.expensesService.updateIngredientPrice(user.userId, id, dto);
  }

  @Delete('ingredients/prices/:id')
  async deleteIngredientPrice(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.deleteIngredientPrice(user.userId, id);
  }

  @Patch('receipts/:id')
  async updateReceipt(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    return this.expensesService.updateReceipt(user.userId, id, dto);
  }

  @Delete('receipts/:id')
  async deleteReceipt(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.deleteReceipt(user.userId, id);
  }

  @Get('spending/monthly')
  async getMonthlySpending(@CurrentUser() user: { userId: string }) {
    return this.expensesService.getMonthlySpending(user.userId, 6);
  }

  @Get('budgets/:month')
  async getBudgets(@CurrentUser() user: { userId: string }, @Param('month') month: string) {
    return this.expensesService.getBudgets(user.userId, month);
  }

  @Put('budgets/:month')
  async upsertBudgets(@CurrentUser() user: { userId: string }, @Param('month') month: string, @Body() dto: UpsertBudgetsDto) {
    return this.expensesService.upsertBudgets(user.userId, month, dto);
  }
}

type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};
