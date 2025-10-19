import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateLoanDto {
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number) // Transform string/json number to number
  amount: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestRate: number; // Misal: 1.5 (untuk 1.5%)

  @IsInt()
  @Min(1)
  termMonths: number;
}
