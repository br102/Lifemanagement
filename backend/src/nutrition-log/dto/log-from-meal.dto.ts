import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MealType } from '@prisma/client';

export class LogFromMealDto {
  @IsString() date!: string;
  @IsString() mealId!: string;
  @IsOptional() @IsEnum(MealType) mealType?: MealType;
  @IsOptional() @IsNumber() @Min(0.1) quantity?: number;
  @IsOptional() @IsString() notes?: string;
}
