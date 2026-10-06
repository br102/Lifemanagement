import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCalendarEventDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() notes?: string;
}
