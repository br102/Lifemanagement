import { GroceriesService } from './groceries.service';
export declare class GroceriesController {
    private readonly groceries;
    constructor(groceries: GroceriesService);
    getForWeek(user: {
        userId: string;
    }, weekStartDate: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
    generate(user: {
        userId: string;
    }, weekStartDate: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
    toggle(user: {
        userId: string;
    }, listId: string, itemId: string): Promise<{
        id: any;
        weekPlanId: any;
        weekStartDate: any;
        generatedAt: any;
        items: any;
    } | null>;
}
