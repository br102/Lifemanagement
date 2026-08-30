import { Body, Controller, Get, Post, UploadedFile, UseFilters, UseInterceptors, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { SupabaseImageStorageService } from '../storage/supabase-image-storage.service';
import { ExpensesService } from './expenses.service';
import { ConfirmReceiptDto, ParseReceiptDto } from './dto/upload-receipt.dto';

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
}

type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};
