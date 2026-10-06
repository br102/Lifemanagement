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
export declare class CalendarService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEvents(userId: string, from?: string, to?: string): Promise<{
        id: any;
        title: any;
        description: any;
        startDate: any;
        endDate: any;
        startTime: any;
        endTime: any;
        category: any;
        location: any;
        allDay: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createEvent(userId: string, dto: CreateCalendarEventDto): Promise<{
        id: any;
        title: any;
        description: any;
        startDate: any;
        endDate: any;
        startTime: any;
        endTime: any;
        category: any;
        location: any;
        allDay: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateEvent(userId: string, id: string, dto: UpdateCalendarEventDto): Promise<{
        id: any;
        title: any;
        description: any;
        startDate: any;
        endDate: any;
        startTime: any;
        endTime: any;
        category: any;
        location: any;
        allDay: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteEvent(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getSchedules(userId: string): Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        weekdays: any;
        interval: any;
        intervalUnit: any;
        startDate: any;
        endDate: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createSchedule(userId: string, dto: CreateRecurringScheduleDto): Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        weekdays: any;
        interval: any;
        intervalUnit: any;
        startDate: any;
        endDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateSchedule(userId: string, id: string, dto: UpdateRecurringScheduleDto): Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        weekdays: any;
        interval: any;
        intervalUnit: any;
        startDate: any;
        endDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteSchedule(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getOccurrences(userId: string, from?: string, to?: string): Promise<ScheduleOccurrence[]>;
    private computeWeekdayOccurrences;
    private computeIntervalOccurrences;
    createOverride(userId: string, scheduleId: string, dto: CreateScheduleOverrideDto): Promise<{
        id: any;
        scheduleId: any;
        date: any;
        reason: any;
        createdAt: any;
        updatedAt: any;
    }>;
    completeSchedule(userId: string, scheduleId: string, dto: CreateScheduleCompletionDto): Promise<{
        id: any;
        scheduleId: any;
        date: any;
        notes: any;
        createdAt: any;
    }>;
    private dateRange;
    private toEvent;
    private toSchedule;
    private toOverride;
    private toCompletion;
}
