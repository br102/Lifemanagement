import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() notes?: string;
}
