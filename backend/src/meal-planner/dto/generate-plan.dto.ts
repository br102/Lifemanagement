import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class GeneratePlanDto {
  @IsString() weekStartDate!: string;

  @IsOptional() @IsString() dietaryRestrictions?: string;
  @IsOptional() @IsString() cuisinePreferences?: string;
  @IsOptional() @IsString() ingredientsToAvoid?: string;
  @IsOptional() @IsEnum(['quick', 'moderate', 'advanced']) cookingLevel?: 'quick' | 'moderate' | 'advanced';
  @IsOptional() @IsNumber() mealRepetition?: number;
  @IsOptional() @IsString() notes?: string;
}
