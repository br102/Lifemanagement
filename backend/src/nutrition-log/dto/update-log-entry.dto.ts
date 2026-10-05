import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MealType } from '@prisma/client';

export class UpdateLogEntryDto {
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsEnum(MealType) mealType?: MealType;
  @IsOptional() @IsNumber() @Min(0.1) quantity?: number;
  @IsOptional() @IsInt() @Min(0) calories?: number;
  @IsOptional() @IsInt() @Min(0) protein?: number;
  @IsOptional() @IsInt() @Min(0) carbs?: number;
  @IsOptional() @IsInt() @Min(0) fat?: number;
  @IsOptional() @IsString() notes?: string;
}
