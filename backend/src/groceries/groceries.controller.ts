import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GroceriesService } from './groceries.service';

@ApiTags('groceries')
@ApiBearerAuth()
@Controller('groceries')
export class GroceriesController {
  constructor(private readonly groceries: GroceriesService) {}

  @Get(':weekStartDate')
  getForWeek(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string) {
    return this.groceries.getByWeek(user.userId, weekStartDate);
  }

  @Post(':weekStartDate/generate')
  generate(@CurrentUser() user: { userId: string }, @Param('weekStartDate') weekStartDate: string) {
    return this.groceries.generateFromWeekPlan(user.userId, weekStartDate);
  }

  @Patch(':listId/items/:itemId/toggle')
  toggle(@CurrentUser() user: { userId: string }, @Param('listId') listId: string, @Param('itemId') itemId: string) {
    return this.groceries.toggleItem(user.userId, listId, itemId);
  }
}
