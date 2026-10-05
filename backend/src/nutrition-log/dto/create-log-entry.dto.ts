import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MealType } from '@prisma/client';

export class CreateLogEntryDto {
  @IsString() date!: string;
  @IsString() label!: string;
  @IsOptional() @IsEnum(MealType) mealType?: MealType;
  @IsOptional() @IsInt() @Min(0) calories?: number;
  @IsOptional() @IsInt() @Min(0) protein?: number;
  @IsOptional() @IsInt() @Min(0) carbs?: number;
  @IsOptional() @IsInt() @Min(0) fat?: number;
  @IsOptional() @IsString() notes?: string;
}
