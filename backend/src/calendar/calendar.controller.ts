import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CreateRecurringScheduleDto } from './dto/create-recurring-schedule.dto';
import { UpdateRecurringScheduleDto } from './dto/update-recurring-schedule.dto';
import { CreateScheduleOverrideDto } from './dto/create-schedule-override.dto';
import { CreateScheduleCompletionDto } from './dto/create-schedule-completion.dto';
import { CalendarService, ScheduleOccurrence } from './calendar.service';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  // ========== Calendar Events ==========

  @Get('events')
  getEvents(
    @CurrentUser() user: { userId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.calendar.getEvents(user.userId, from, to);
  }

  @Post('events')
  createEvent(@CurrentUser() user: { userId: string }, @Body() dto: CreateCalendarEventDto) {
    return this.calendar.createEvent(user.userId, dto);
  }

  @Patch('events/:id')
  updateEvent(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendar.updateEvent(user.userId, id, dto);
  }

  @Delete('events/:id')
  deleteEvent(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.calendar.deleteEvent(user.userId, id);
  }

  // ========== Recurring Schedules ==========

  @Get('schedules')
  getSchedules(@CurrentUser() user: { userId: string }) {
    return this.calendar.getSchedules(user.userId);
  }

  @Post('schedules')
  createSchedule(@CurrentUser() user: { userId: string }, @Body() dto: CreateRecurringScheduleDto) {
    return this.calendar.createSchedule(user.userId, dto);
  }

  @Patch('schedules/:id')
  updateSchedule(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateRecurringScheduleDto,
  ) {
    return this.calendar.updateSchedule(user.userId, id, dto);
  }

  @Delete('schedules/:id')
  deleteSchedule(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.calendar.deleteSchedule(user.userId, id);
  }

  // ========== Schedule Occurrences ==========

  @Get('schedules/occurrences')
  getOccurrences(
    @CurrentUser() user: { userId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ScheduleOccurrence[]> {
    return this.calendar.getOccurrences(user.userId, from, to);
  }

  // ========== Schedule Overrides ==========

  @Post('schedules/:id/override')
  createOverride(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CreateScheduleOverrideDto,
  ) {
    return this.calendar.createOverride(user.userId, id, dto);
  }

  // ========== Schedule Completions ==========

  @Post('schedules/:id/complete')
  completeSchedule(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CreateScheduleCompletionDto,
  ) {
    return this.calendar.completeSchedule(user.userId, id, dto);
  }
}
