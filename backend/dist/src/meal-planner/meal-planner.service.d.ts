import { PrismaService } from '../database/prisma.service';
import { UpsertSlotDto } from './dto/upsert-slot.dto';
import { AiProvider } from '../ai/ai-provider.interface';
export declare class MealPlannerService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiProvider);
    getWeek(userId: string, weekStartDate: string): Promise<{
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
    upsertSlot(userId: string, weekStartDate: string, dto: UpsertSlotDto): Promise<{
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
    aiGenerate(userId: string, weekStartDate: string): Promise<{
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
    getMonth(userId: string, month: string): Promise<{
        month: string;
        days: {
            date: string;
            breakfast: string | null;
            lunch: string | null;
            dinner: string | null;
        }[];
    }>;
}
