import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AiCategorizeDto, AiNutritionDto } from './dto/ai-tools.dto';
import { MealsService } from './meals.service';
import { SupabaseImageStorageService } from '../storage/supabase-image-storage.service';

@ApiTags('meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(
    private readonly mealsService: MealsService,
    private readonly imageStorage: SupabaseImageStorageService,
  ) {}

  @Post('upload-image')
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedImageFile) {
    const { publicUrl } = await this.imageStorage.uploadMealImage(file);
    return { imageUrl: publicUrl };
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }, @Query('search') search?: string, @Query('type') type?: string) {
    return this.mealsService.findAll(user.userId, search, type);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.mealsService.findById(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMealDto) {
    return this.mealsService.create(user.userId, dto);
  }

  @Post('ai/categorize')
  categorize(@Body() dto: AiCategorizeDto) {
    return this.mealsService.aiCategorize(dto.name, dto.ingredients);
  }

  @Post('ai/nutrition')
  nutrition(@Body() dto: AiNutritionDto) {
    return this.mealsService.aiNutrition(dto.name, dto.ingredients);
  }

  @Post('ai/from-link')
  draftFromLink(@Body() dto: { link: string }) {
    return this.mealsService.aiDraftFromLink(dto.link);
  }

  @Patch(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.mealsService.remove(user.userId, id);
  }
}

type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};
