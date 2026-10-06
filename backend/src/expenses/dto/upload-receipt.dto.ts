import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiptLineItemDto {
  @IsString() name!: string;
  @IsNumber() quantity!: number;
  @IsString() unit!: string;
  @IsNumber() price!: number;
}

export class ConfirmReceiptDto {
  @IsString() store!: string;
  @IsString() purchaseDate!: string;
  @IsNumber() @IsOptional() totalAmount?: number;
  @IsString() @IsOptional() currency?: string;
  @IsString() imageUrl!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptLineItemDto)
  items!: ReceiptLineItemDto[];
}

export class ParseReceiptDto {
  @IsString() imageUrl!: string;
}

export class UpdateIngredientDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() category?: string;
}

export class UpdateIngredientPriceDto {
  @IsNumber() @IsOptional() price?: number;
  @IsNumber() @IsOptional() quantity?: number;
  @IsString() @IsOptional() unit?: string;
  @IsString() @IsOptional() purchaseDate?: string;
}

export class ReceiptLineItemUpdateDto {
  @IsString() @IsOptional() name?: string;
  @IsNumber() @IsOptional() quantity?: number;
  @IsString() @IsOptional() unit?: string;
  @IsNumber() @IsOptional() price?: number;
}

export class UpdateReceiptDto {
  @IsString() @IsOptional() store?: string;
  @IsString() @IsOptional() purchaseDate?: string;
  @IsNumber() @IsOptional() totalAmount?: number;
  @IsString() @IsOptional() currency?: string;
  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReceiptLineItemDto)
  items?: ReceiptLineItemDto[];
}

export class BudgetItemDto {
  @IsString() category!: string;
  @IsNumber() amountLimit!: number;
}

export class UpsertBudgetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  items!: BudgetItemDto[];
}
