import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateAccountDto } from './savings/dto/create-account.dto';
import { TransactionDto } from './savings/dto/transaction.dto';

@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post('/accounts')
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.savingsService.createAccount(createAccountDto);
  }

  @Post('/deposit')
  deposit(@Body() transactionDto: TransactionDto) {
    return this.savingsService.deposit(transactionDto);
  }

  @Post('/withdraw')
  withdraw(@Body() transactionDto: TransactionDto) {
    return this.savingsService.withdraw(transactionDto);
  }

  @Get('/accounts')
  findAllAccounts() {
    return this.savingsService.findAllAccounts();
  }

  @Get('/accounts/:id')
  findAccountById(@Param('id', ParseIntPipe) id: number) {
    return this.savingsService.findAccountById(id);
  }
}
