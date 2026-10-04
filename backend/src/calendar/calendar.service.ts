import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CreateRecurringScheduleDto } from './dto/create-recurring-schedule.dto';
import { UpdateRecurringScheduleDto } from './dto/update-recurring-schedule.dto';
import { CreateScheduleOverrideDto } from './dto/create-schedule-override.dto';
import { CreateScheduleCompletionDto } from './dto/create-schedule-completion.dto';

export interface ScheduleOccurrence {
  date: string;
  scheduleId: string;
  title: string;
  description?: string;
  type: string;
  isCompleted: boolean;
  isOverridden: boolean;
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== Calendar Events ==========

  async getEvents(userId: string, from?: string, to?: string) {
    const rows = await this.prisma.calendarEvent.findMany({
      where: { userId, ...this.dateRange(from, to) },
      orderBy: { startTime: 'asc' },
    });
    return rows.map(this.toEvent);
  }

  async createEvent(userId: string, dto: CreateCalendarEventDto) {
    const row = await this.prisma.calendarEvent.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        date: dto.date,
        location: dto.location,
        isAllDay: dto.isAllDay ?? false,
      },
    });
    return this.toEvent(row);
  }

  async updateEvent(userId: string, id: string, dto: UpdateCalendarEventDto) {
    const existing = await this.prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Event not found');

    const row = await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        startTime: dto.startTime ?? existing.startTime,
        endTime: dto.endTime ?? existing.endTime,
        date: dto.date ?? existing.date,
        location: dto.location ?? existing.location,
        isAllDay: dto.isAllDay ?? existing.isAllDay,
      },
    });
    return this.toEvent(row);
  }

  async deleteEvent(userId: string, id: string) {
    const existing = await this.prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Event not found');
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { success: true };
  }

  // ========== Recurring Schedules ==========

  async getSchedules(userId: string) {
    const rows = await this.prisma.recurringSchedule.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    });
    return rows.map(this.toSchedule);
  }

  async createSchedule(userId: string, dto: CreateRecurringScheduleDto) {
    const row = await this.prisma.recurringSchedule.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        weekdays: dto.weekdays ?? [],
        interval: dto.interval,
        intervalUnit: dto.intervalUnit,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });
    return this.toSchedule(row);
  }

  async updateSchedule(userId: string, id: string, dto: UpdateRecurringScheduleDto) {
    const existing = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Schedule not found');

    const row = await this.prisma.recurringSchedule.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        type: dto.type ?? existing.type,
        weekdays: dto.weekdays ?? existing.weekdays,
        interval: dto.interval ?? existing.interval,
        intervalUnit: dto.intervalUnit ?? existing.intervalUnit,
        startDate: dto.startDate ?? existing.startDate,
        endDate: dto.endDate ?? existing.endDate,
      },
    });
    return this.toSchedule(row);
  }

  async deleteSchedule(userId: string, id: string) {
    const existing = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Schedule not found');
    await this.prisma.recurringSchedule.delete({ where: { id } });
    return { success: true };
  }

  // ========== Schedule Occurrences ==========

  async getOccurrences(userId: string, from?: string, to?: string): Promise<ScheduleOccurrence[]> {
    const schedules = await this.prisma.recurringSchedule.findMany({
      where: { userId },
      include: {
        overrides: true,
        completions: true,
      },
    });

    const fromDate = from || new Date().toISOString().split('T')[0];
    const toDate = to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const occurrences: ScheduleOccurrence[] = [];

    for (const schedule of schedules) {
      if (schedule.type === 'weekday') {
        const weekdayOccurrences = this.computeWeekdayOccurrences(
          schedule,
          fromDate,
          toDate,
        );
        occurrences.push(...weekdayOccurrences);
      } else if (schedule.type === 'interval') {
        const intervalOccurrences = this.computeIntervalOccurrences(
          schedule,
          fromDate,
          toDate,
        );
        occurrences.push(...intervalOccurrences);
      }
    }

    return occurrences.sort((a, b) => a.date.localeCompare(b.date));
  }

  private computeWeekdayOccurrences(
    schedule: any,
    fromDate: string,
    toDate: string,
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const weekdays = schedule.weekdays as number[];

    if (!weekdays || weekdays.length === 0) return occurrences;

    let current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();

      if (weekdays.includes(dayOfWeek)) {
        const isOverridden = schedule.overrides.some((o: any) => o.date === dateStr);
        const completion = schedule.completions.find((c: any) => c.date === dateStr);

        occurrences.push({
          date: dateStr,
          scheduleId: schedule.id,
          title: schedule.title,
          description: schedule.description,
          type: schedule.type,
          isCompleted: !!completion,
          isOverridden,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return occurrences;
  }

  private computeIntervalOccurrences(
    schedule: any,
    fromDate: string,
    toDate: string,
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const interval = schedule.interval || 1;
    const intervalUnit = schedule.intervalUnit || 'day';

    let current = new Date(schedule.startDate);
    const end = new Date(toDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];

      if (dateStr >= fromDate) {
        const isOverridden = schedule.overrides.some((o: any) => o.date === dateStr);
        const completion = schedule.completions.find((c: any) => c.date === dateStr);

        occurrences.push({
          date: dateStr,
          scheduleId: schedule.id,
          title: schedule.title,
          description: schedule.description,
          type: schedule.type,
          isCompleted: !!completion,
          isOverridden,
        });
      }

      // Increment by interval
      if (intervalUnit === 'day') {
        current.setDate(current.getDate() + interval);
      } else if (intervalUnit === 'week') {
        current.setDate(current.getDate() + interval * 7);
      } else if (intervalUnit === 'month') {
        current.setMonth(current.getMonth() + interval);
      }
    }

    return occurrences;
  }

  // ========== Schedule Overrides ==========

  async createOverride(userId: string, scheduleId: string, dto: CreateScheduleOverrideDto) {
    const schedule = await this.prisma.recurringSchedule.findFirst({
      where: { id: scheduleId, userId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const row = await this.prisma.scheduleOverride.create({
      data: {
        userId,
        recurringScheduleId: scheduleId,
        date: dto.date,
        reason: dto.reason,
      },
    });
    return this.toOverride(row);
  }

  // ========== Schedule Completions ==========

  async completeSchedule(userId: string, scheduleId: string, dto: CreateScheduleCompletionDto) {
    const schedule = await this.prisma.recurringSchedule.findFirst({
      where: { id: scheduleId, userId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const row = await this.prisma.scheduleCompletion.create({
      data: {
        userId,
        recurringScheduleId: scheduleId,
        date: dto.date,
        notes: dto.notes,
      },
    });
    return this.toCompletion(row);
  }

  // ========== Helper Methods ==========

  private dateRange(from?: string, to?: string) {
    if (!from && !to) return {};
    return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
  }

  private toEvent = (event: any) => ({
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    startTime: event.startTime,
    endTime: event.endTime,
    date: event.date,
    location: event.location ?? undefined,
    isAllDay: event.isAllDay,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  });

  private toSchedule = (schedule: any) => ({
    id: schedule.id,
    title: schedule.title,
    description: schedule.description ?? undefined,
    type: schedule.type,
    weekdays: schedule.weekdays,
    interval: schedule.interval ?? undefined,
    intervalUnit: schedule.intervalUnit ?? undefined,
    startDate: schedule.startDate,
    endDate: schedule.endDate ?? undefined,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  });

  private toOverride = (override: any) => ({
    id: override.id,
    scheduleId: override.recurringScheduleId,
    date: override.date,
    reason: override.reason ?? undefined,
    createdAt: override.createdAt.toISOString(),
    updatedAt: override.updatedAt.toISOString(),
  });

  private toCompletion = (completion: any) => ({
    id: completion.id,
    scheduleId: completion.recurringScheduleId,
    date: completion.date,
    notes: completion.notes ?? undefined,
    createdAt: completion.createdAt.toISOString(),
  });
}
