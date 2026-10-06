"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CalendarService = class CalendarService {
    constructor(prisma) {
        this.prisma = prisma;
        this.toEvent = (event) => ({
            id: event.id,
            title: event.title,
            description: event.description ?? undefined,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime ?? undefined,
            endTime: event.endTime ?? undefined,
            category: event.category,
            location: event.location ?? undefined,
            allDay: event.allDay,
            notes: event.notes ?? undefined,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        });
        this.toSchedule = (schedule) => ({
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
        this.toOverride = (override) => ({
            id: override.id,
            scheduleId: override.recurringScheduleId,
            date: override.date,
            reason: override.reason ?? undefined,
            createdAt: override.createdAt.toISOString(),
            updatedAt: override.updatedAt.toISOString(),
        });
        this.toCompletion = (completion) => ({
            id: completion.id,
            scheduleId: completion.recurringScheduleId,
            date: completion.date,
            notes: completion.notes ?? undefined,
            createdAt: completion.createdAt.toISOString(),
        });
    }
    async getEvents(userId, from, to) {
        const rows = await this.prisma.calendarEvent.findMany({
            where: { userId, ...this.dateRange(from, to) },
            orderBy: { startTime: 'asc' },
        });
        return rows.map(this.toEvent);
    }
    async createEvent(userId, dto) {
        const row = await this.prisma.calendarEvent.create({
            data: {
                userId,
                title: dto.title,
                description: dto.description,
                startDate: dto.startDate,
                endDate: dto.endDate,
                startTime: dto.startTime,
                endTime: dto.endTime,
                category: dto.category ?? 'events',
                location: dto.location,
                allDay: dto.allDay ?? false,
                notes: dto.notes,
            },
        });
        return this.toEvent(row);
    }
    async updateEvent(userId, id, dto) {
        const existing = await this.prisma.calendarEvent.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found');
        const row = await this.prisma.calendarEvent.update({
            where: { id },
            data: {
                title: dto.title ?? existing.title,
                description: dto.description ?? existing.description,
                startDate: dto.startDate ?? existing.startDate,
                endDate: dto.endDate ?? existing.endDate,
                startTime: dto.startTime ?? existing.startTime,
                endTime: dto.endTime ?? existing.endTime,
                category: dto.category ?? existing.category,
                location: dto.location ?? existing.location,
                allDay: dto.allDay ?? existing.allDay,
                notes: dto.notes ?? existing.notes,
            },
        });
        return this.toEvent(row);
    }
    async deleteEvent(userId, id) {
        const existing = await this.prisma.calendarEvent.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found');
        await this.prisma.calendarEvent.delete({ where: { id } });
        return { success: true };
    }
    async getSchedules(userId) {
        const rows = await this.prisma.recurringSchedule.findMany({
            where: { userId },
            orderBy: { startDate: 'asc' },
        });
        return rows.map(this.toSchedule);
    }
    async createSchedule(userId, dto) {
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
    async updateSchedule(userId, id, dto) {
        const existing = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Schedule not found');
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
    async deleteSchedule(userId, id) {
        const existing = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Schedule not found');
        await this.prisma.recurringSchedule.delete({ where: { id } });
        return { success: true };
    }
    async getOccurrences(userId, from, to) {
        const schedules = await this.prisma.recurringSchedule.findMany({
            where: { userId },
            include: {
                overrides: true,
                completions: true,
            },
        });
        const fromDate = from || new Date().toISOString().split('T')[0];
        const toDate = to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const occurrences = [];
        for (const schedule of schedules) {
            if (schedule.type === 'weekday') {
                const weekdayOccurrences = this.computeWeekdayOccurrences(schedule, fromDate, toDate);
                occurrences.push(...weekdayOccurrences);
            }
            else if (schedule.type === 'interval') {
                const intervalOccurrences = this.computeIntervalOccurrences(schedule, fromDate, toDate);
                occurrences.push(...intervalOccurrences);
            }
        }
        return occurrences.sort((a, b) => a.date.localeCompare(b.date));
    }
    computeWeekdayOccurrences(schedule, fromDate, toDate) {
        const occurrences = [];
        const weekdays = schedule.weekdays;
        if (!weekdays || weekdays.length === 0)
            return occurrences;
        let current = new Date(fromDate);
        const end = new Date(toDate);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const dayOfWeek = current.getDay();
            if (weekdays.includes(dayOfWeek)) {
                const isOverridden = schedule.overrides.some((o) => o.date === dateStr);
                const completion = schedule.completions.find((c) => c.date === dateStr);
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
    computeIntervalOccurrences(schedule, fromDate, toDate) {
        const occurrences = [];
        const interval = schedule.interval || 1;
        const intervalUnit = schedule.intervalUnit || 'day';
        let current = new Date(schedule.startDate);
        const end = new Date(toDate);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            if (dateStr >= fromDate) {
                const isOverridden = schedule.overrides.some((o) => o.date === dateStr);
                const completion = schedule.completions.find((c) => c.date === dateStr);
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
            if (intervalUnit === 'day') {
                current.setDate(current.getDate() + interval);
            }
            else if (intervalUnit === 'week') {
                current.setDate(current.getDate() + interval * 7);
            }
            else if (intervalUnit === 'month') {
                current.setMonth(current.getMonth() + interval);
            }
        }
        return occurrences;
    }
    async createOverride(userId, scheduleId, dto) {
        const schedule = await this.prisma.recurringSchedule.findFirst({
            where: { id: scheduleId, userId },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Schedule not found');
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
    async completeSchedule(userId, scheduleId, dto) {
        const schedule = await this.prisma.recurringSchedule.findFirst({
            where: { id: scheduleId, userId },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Schedule not found');
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
    dateRange(from, to) {
        if (!from && !to)
            return {};
        return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map