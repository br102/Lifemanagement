import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCalendarEventDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() isAllDay?: boolean;
}
