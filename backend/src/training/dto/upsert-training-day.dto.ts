import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class TrainingDayExerciseDto {
  @IsString() exerciseId!: string;
  @IsOptional() @IsInt() @Min(1) sets?: number;
  @IsOptional() @IsInt() @Min(1) reps?: number;
  @IsOptional() @IsInt() @Min(1) durationMin?: number;
  @IsOptional() @IsNumber() targetWeight?: number;
  @IsOptional() @IsString() intensity?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpsertTrainingDayDto {
  @IsString() date!: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => TrainingDayExerciseDto) exercises!: TrainingDayExerciseDto[];
}
