import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetCalories?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetProtein?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetCarbs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetFat?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  mealsPerDay?: number;
}
