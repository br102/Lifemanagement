import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MealsModule } from './meals/meals.module';
import { MealPlannerModule } from './meal-planner/meal-planner.module';
import { GroceriesModule } from './groceries/groceries.module';
import { ProfileModule } from './profile/profile.module';
import { TrainingModule } from './training/training.module';
import { AiModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RateLimitMiddleware } from './common/rate-limit/rate-limit.middleware';
import { RequestLoggerMiddleware } from './common/logger/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AiModule,
    StorageModule,
    MealsModule,
    MealPlannerModule,
    GroceriesModule,
    ProfileModule,
    TrainingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware, RateLimitMiddleware).forRoutes('*');
  }
}
