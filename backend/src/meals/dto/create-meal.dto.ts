import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

class IngredientDto {
  @IsString() name!: string;
  @IsString() amount!: string;
  @IsString() unit!: string;
}

class NutritionDto {
  @IsInt() calories!: number;
  @IsInt() protein!: number;
  @IsInt() carbs!: number;
  @IsInt() fat!: number;
  @IsInt() fiber!: number;
  @IsInt() sugar!: number;
  @IsInt() sodium!: number;
}

export class CreateMealDto {
  @IsString() name!: string;
  @IsInt() @Min(1) @Max(5) score!: number;
  @IsOptional() @IsString() category?: string;
  @IsArray() @IsString({ each: true }) types!: string[];
  @ValidateNested({ each: true }) @Type(() => IngredientDto) ingredients!: IngredientDto[];
  @IsArray() @IsString({ each: true }) steps!: string[];
  @IsOptional() @IsString() link?: string;
  @ValidateNested() @Type(() => NutritionDto) nutritionalValue!: NutritionDto;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsInt() prepTime?: number;
  @IsOptional() @IsInt() cookTime?: number;
  @IsOptional() @IsInt() servings?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
