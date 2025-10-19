import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './loans/dto/create-loan.dto';
import { PayRepaymentDto } from './loans/dto/pay-repayment.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('/apply')
  apply(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.apply(createLoanDto);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.approve(id);
  }

  @Patch(':id/disburse')
  disburse(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.disburse(id);
  }

  @Post('/repayments/pay')
  payInstallment(@Body() payRepaymentDto: PayRepaymentDto) {
    return this.loansService.payInstallment(payRepaymentDto);
  }

  @Get()
  findAll() {
    return this.loansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOne(id);
  }
}
