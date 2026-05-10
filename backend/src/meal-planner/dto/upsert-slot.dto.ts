import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpsertSlotDto {
  @IsString() date!: string;
  @IsIn(['breakfast','lunch','snack','proteinShake','dinner']) slot!: 'breakfast'|'lunch'|'snack'|'proteinShake'|'dinner';
  @IsOptional() @IsString() mealId?: string;
}
