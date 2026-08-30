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
