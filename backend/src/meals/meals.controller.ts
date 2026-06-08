import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AiCategorizeDto, AiNutritionDto } from './dto/ai-tools.dto';
import { MealsService } from './meals.service';

@ApiTags('meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req: any, file: any, cb: any) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    return { imageUrl: `/uploads/${file.filename}` };
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

  @Patch(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.mealsService.remove(user.userId, id);
  }
}
