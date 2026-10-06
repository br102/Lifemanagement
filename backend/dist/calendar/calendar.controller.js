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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const create_calendar_event_dto_1 = require("./dto/create-calendar-event.dto");
const update_calendar_event_dto_1 = require("./dto/update-calendar-event.dto");
const create_recurring_schedule_dto_1 = require("./dto/create-recurring-schedule.dto");
const update_recurring_schedule_dto_1 = require("./dto/update-recurring-schedule.dto");
const create_schedule_override_dto_1 = require("./dto/create-schedule-override.dto");
const create_schedule_completion_dto_1 = require("./dto/create-schedule-completion.dto");
const calendar_service_1 = require("./calendar.service");
let CalendarController = class CalendarController {
    constructor(calendar) {
        this.calendar = calendar;
    }
    getEvents(user, from, to) {
        return this.calendar.getEvents(user.userId, from, to);
    }
    createEvent(user, dto) {
        return this.calendar.createEvent(user.userId, dto);
    }
    updateEvent(user, id, dto) {
        return this.calendar.updateEvent(user.userId, id, dto);
    }
    deleteEvent(user, id) {
        return this.calendar.deleteEvent(user.userId, id);
    }
    getSchedules(user) {
        return this.calendar.getSchedules(user.userId);
    }
    createSchedule(user, dto) {
        return this.calendar.createSchedule(user.userId, dto);
    }
    updateSchedule(user, id, dto) {
        return this.calendar.updateSchedule(user.userId, id, dto);
    }
    deleteSchedule(user, id) {
        return this.calendar.deleteSchedule(user.userId, id);
    }
    getOccurrences(user, from, to) {
        return this.calendar.getOccurrences(user.userId, from, to);
    }
    createOverride(user, id, dto) {
        return this.calendar.createOverride(user.userId, id, dto);
    }
    completeSchedule(user, id, dto) {
        return this.calendar.completeSchedule(user.userId, id, dto);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_calendar_event_dto_1.CreateCalendarEventDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_calendar_event_dto_1.UpdateCalendarEventDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Get)('schedules'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.Post)('schedules'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_recurring_schedule_dto_1.CreateRecurringScheduleDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Patch)('schedules/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_recurring_schedule_dto_1.UpdateRecurringScheduleDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)('schedules/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Get)('schedules/occurrences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getOccurrences", null);
__decorate([
    (0, common_1.Post)('schedules/:id/override'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_schedule_override_dto_1.CreateScheduleOverrideDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Post)('schedules/:id/complete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_schedule_completion_dto_1.CreateScheduleCompletionDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "completeSchedule", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map