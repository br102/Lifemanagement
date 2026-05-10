import { Global, Module } from '@nestjs/common';
import { MockAiProvider } from './mock-ai.provider';

@Global()
@Module({
  providers: [{ provide: 'AI_PROVIDER', useClass: MockAiProvider }],
  exports: ['AI_PROVIDER'],
})
export class AiModule {}
