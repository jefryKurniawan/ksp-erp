import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TransactionDto {
  @IsInt()
  accountId: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}