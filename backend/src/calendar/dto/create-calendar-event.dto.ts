import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() startTime!: string;
  @IsString() endTime!: string;
  @IsString() date!: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() isAllDay?: boolean;
}
