import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class WorkoutSessionExerciseDto {
  @IsString() exerciseId!: string;
  @IsOptional() @IsInt() @Min(1) sets?: number;
  @IsOptional() @IsInt() @Min(1) reps?: number;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsInt() @Min(1) durationMin?: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateWorkoutSessionDto {
  @IsString() date!: string;
  @IsOptional() @IsString() trainingDayId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsInt() @Min(1) durationMin?: number;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => WorkoutSessionExerciseDto) exercises!: WorkoutSessionExerciseDto[];
}
