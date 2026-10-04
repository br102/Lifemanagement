import { IsString, IsOptional } from 'class-validator';

export class CreateScheduleCompletionDto {
  @IsString() date!: string;
  @IsOptional() @IsString() notes?: string;
}
