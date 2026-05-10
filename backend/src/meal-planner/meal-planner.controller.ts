import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpsertSlotDto } from './dto/upsert-slot.dto';
import { MealPlannerService } from './meal-planner.service';

@ApiTags('meal-planner')
@ApiBearerAuth()
@Controller('planner')
export class MealPlannerController {
  constructor(private readonly planner: MealPlannerService) {}

  @Get('month/:month')
  getMonth(@CurrentUser() user: { userId: string }, @Param('month') month: string) {
    return this.planner.getMonth(user.userId, month);
  }

  @Get('week/:weekStartDate')
  getWeek(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string) {
    return this.planner.getWeek(user.userId, weekStartDate);
  }

  @Post('week/:weekStartDate/slot')
  setSlot(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string, @Body() dto: UpsertSlotDto) {
    return this.planner.upsertSlot(user.userId, weekStartDate, dto);
  }

  @Post('week/:weekStartDate/ai-generate')
  aiGenerate(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string) {
    return this.planner.aiGenerate(user.userId, weekStartDate);
  }
}
