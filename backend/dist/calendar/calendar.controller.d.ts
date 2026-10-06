import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CreateRecurringScheduleDto } from './dto/create-recurring-schedule.dto';
import { UpdateRecurringScheduleDto } from './dto/update-recurring-schedule.dto';
import { CreateScheduleOverrideDto } from './dto/create-schedule-override.dto';
import { CreateScheduleCompletionDto } from './dto/create-schedule-completion.dto';
import { CalendarService, ScheduleOccurrence } from './calendar.service';
export declare class CalendarController {
    private readonly calendar;
    constructor(calendar: CalendarService);
    getEvents(user: {
        userId: string;
    }, from?: string, to?: string): Promise<{
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
    createEvent(user: {
        userId: string;
    }, dto: CreateCalendarEventDto): Promise<{
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
    updateEvent(user: {
        userId: string;
    }, id: string, dto: UpdateCalendarEventDto): Promise<{
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
    deleteEvent(user: {
        userId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
    getSchedules(user: {
        userId: string;
    }): Promise<{
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
    createSchedule(user: {
        userId: string;
    }, dto: CreateRecurringScheduleDto): Promise<{
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
    updateSchedule(user: {
        userId: string;
    }, id: string, dto: UpdateRecurringScheduleDto): Promise<{
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
    deleteSchedule(user: {
        userId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
    getOccurrences(user: {
        userId: string;
    }, from?: string, to?: string): Promise<ScheduleOccurrence[]>;
    createOverride(user: {
        userId: string;
    }, id: string, dto: CreateScheduleOverrideDto): Promise<{
        id: any;
        scheduleId: any;
        date: any;
        reason: any;
        createdAt: any;
        updatedAt: any;
    }>;
    completeSchedule(user: {
        userId: string;
    }, id: string, dto: CreateScheduleCompletionDto): Promise<{
        id: any;
        scheduleId: any;
        date: any;
        notes: any;
        createdAt: any;
    }>;
}
