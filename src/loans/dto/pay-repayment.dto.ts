import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PayRepaymentDto {
  @IsInt()
  repaymentId: number; // ID dari angsuran yang ingin dibayar

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amountPaid: number;
}
