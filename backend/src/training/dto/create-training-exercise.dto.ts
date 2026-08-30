import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateTrainingExerciseDto {
  @IsString() name!: string;
  @IsString() category!: string;
  @IsArray() @IsString({ each: true }) muscleGroups!: string[];
  @IsOptional() @IsString() equipment?: string;
  @IsOptional() @IsString() difficulty?: string;
  @IsOptional() @IsString() instructions?: string;
}
