import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogFromMealDto } from './dto/log-from-meal.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { NutritionLogService } from './nutrition-log.service';

@ApiTags('nutrition-log')
@ApiBearerAuth()
@Controller('nutrition-log')
export class NutritionLogController {
  constructor(private readonly service: NutritionLogService) {}

  @Get('day/:date')
  getDay(@CurrentUser() user: { userId: string }, @Param('date') date: string) {
    return this.service.getDay(user.userId, date);
  }

  @Get()
  getRange(
    @CurrentUser() user: { userId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getRange(user.userId, from, to);
  }

  @Post('from-meal')
  logFromMeal(@CurrentUser() user: { userId: string }, @Body() dto: LogFromMealDto) {
    return this.service.logFromMeal(user.userId, dto);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateLogEntryDto) {
    return this.service.createCustom(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateLogEntryDto,
  ) {
    return this.service.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.remove(user.userId, id);
  }
}
