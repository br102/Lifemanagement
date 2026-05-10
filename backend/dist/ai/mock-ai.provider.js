"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAiProvider = void 0;
const common_1 = require("@nestjs/common");
let MockAiProvider = class MockAiProvider {
    async classifyMeal(name) {
        const lower = name.toLowerCase();
        return {
            category: lower.includes('pasta') ? 'Italian' : 'Healthy',
            types: lower.includes('shake') ? ['Protein Shake'] : ['Dinner'],
        };
    }
    async estimateNutrition() {
        return { calories: 350, protein: 24, carbs: 30, fat: 10, fiber: 6, sugar: 7, sodium: 320 };
    }
    async generateWeekPlan(input) {
        const plan = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(input.weekStartDate);
            date.setDate(date.getDate() + i);
            const key = date.toISOString().slice(0, 10);
            const first = input.meals[0]?.id;
            plan[key] = { breakfast: first, lunch: first, snack: first, dinner: first };
        }
        return plan;
    }
    async suggestGroceryMeta(items) {
        return items.map((i) => ({ category: i.category, itemName: i.name }));
    }
};
exports.MockAiProvider = MockAiProvider;
exports.MockAiProvider = MockAiProvider = __decorate([
    (0, common_1.Injectable)()
], MockAiProvider);
//# sourceMappingURL=mock-ai.provider.js.map