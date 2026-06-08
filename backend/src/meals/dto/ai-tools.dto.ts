import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IngredientInputDto {
  @IsString() name!: string;
  @IsString() amount!: string;
  @IsString() unit!: string;
}

export class AiCategorizeDto {
  @IsString() name!: string;
  @IsArray() @IsString({ each: true }) ingredients!: string[];
}

export class AiNutritionDto {
  @IsString() name!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientInputDto)
  ingredients!: IngredientInputDto[];
}

