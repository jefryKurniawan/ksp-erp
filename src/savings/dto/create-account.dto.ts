import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @IsString()
  @MinLength(5)
  accountNumber: string;
}