import { IsString, IsArray, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateRecurringScheduleDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) weekdays?: number[];
  @IsOptional() @IsInt() @Min(1) interval?: number;
  @IsOptional() @IsString() intervalUnit?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
}
