import { PrismaService } from '../database/prisma.service';
import { AiProvider } from '../ai/ai-provider.interface';
export declare class GroceriesService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiProvider);
    getByWeek(userId: string, weekStartDate: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
    toggleItem(userId: string, listId: string, itemId: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
    generateFromWeekPlan(userId: string, weekStartDate: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
    private mapList;
}
