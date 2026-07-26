"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const openai_provider_1 = require("./openai.provider");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            openai_provider_1.OpenAiProvider,
            {
                provide: 'AI_PROVIDER',
                useFactory: (openai) => {
                    const selected = (process.env.AI_PROVIDER || 'openai').toLowerCase();
                    if (selected !== 'openai') {
                        throw new Error(`Unsupported AI_PROVIDER "${selected}". This backend only supports "openai".`);
                    }
                    if (!process.env.OPENAI_API_KEY) {
                        throw new Error('AI_PROVIDER=openai but OPENAI_API_KEY is missing');
                    }
                    console.log('[AI] Provider selected: openai');
                    return openai;
                },
                inject: [openai_provider_1.OpenAiProvider],
            },
        ],
        exports: ['AI_PROVIDER'],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map