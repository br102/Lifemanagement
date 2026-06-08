import { Global, Module } from '@nestjs/common';
import { OpenAiProvider } from './openai.provider';

@Global()
@Module({
  providers: [
    OpenAiProvider,
    {
      provide: 'AI_PROVIDER',
      useFactory: (openai: OpenAiProvider) => {
        const selected = (process.env.AI_PROVIDER || 'openai').toLowerCase();
        if (selected !== 'openai') {
          throw new Error(`Unsupported AI_PROVIDER "${selected}". This backend only supports "openai".`);
        }
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('AI_PROVIDER=openai but OPENAI_API_KEY is missing');
        }
        // eslint-disable-next-line no-console
        console.log('[AI] Provider selected: openai');
        return openai;
      },
      inject: [OpenAiProvider],
    },
  ],
  exports: ['AI_PROVIDER'],
})
export class AiModule {}
