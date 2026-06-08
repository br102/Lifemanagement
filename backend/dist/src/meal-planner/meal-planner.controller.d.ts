import { UpsertSlotDto } from './dto/upsert-slot.dto';
import { MealPlannerService } from './meal-planner.service';
export declare class MealPlannerController {
    private readonly planner;
    constructor(planner: MealPlannerService);
    getMonth(user: {
        userId: string;
    }, month: string): Promise<{
        month: string;
        days: {
            date: string;
            breakfast: string | null;
            lunch: string | null;
            dinner: string | null;
        }[];
    }>;
    getWeek(user: {
        userId: string;
    }, weekStartDate: string): Promise<{
        id: string;
        startDate: string;
        days: never[];
        aiGenerated?: undefined;
    } | {
        id: string;
        startDate: string;
        aiGenerated: boolean;
        days: {
            date: string;
            breakfast: string | null;
            lunch: string | null;
            snack: string | null;
            proteinShake: string | null;
            dinner: string | null;
        }[];
    }>;
    setSlot(user: {
        userId: string;
    }, weekStartDate: string, dto: UpsertSlotDto): Promise<{
        id: string;
        startDate: string;
        days: never[];
        aiGenerated?: undefined;
    } | {
        id: string;
        startDate: string;
        aiGenerated: boolean;
        days: {
            date: string;
            breakfast: string | null;
            lunch: string | null;
            snack: string | null;
            proteinShake: string | null;
            dinner: string | null;
        }[];
    }>;
    aiGenerate(user: {
        userId: string;
    }, weekStartDate: string): Promise<{
        id: string;
        startDate: string;
        days: never[];
        aiGenerated?: undefined;
    } | {
        id: string;
        startDate: string;
        aiGenerated: boolean;
        days: {
            date: string;
            breakfast: string | null;
            lunch: string | null;
            snack: string | null;
            proteinShake: string | null;
            dinner: string | null;
        }[];
    }>;
}
