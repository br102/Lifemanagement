import { IsString, IsOptional } from 'class-validator';

export class CreateScheduleOverrideDto {
  @IsString() date!: string;
  @IsOptional() @IsString() reason?: string;
}
