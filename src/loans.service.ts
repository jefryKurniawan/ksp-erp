import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateLoanDto } from './loans/dto/create-loan.dto';
import { PayRepaymentDto } from './loans/dto/pay-repayment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  // 1. Mengajukan Pinjaman Baru
  async apply(createLoanDto: CreateLoanDto) {
    // Pastikan member ada
    const member = await this.prisma.member.findUnique({
      where: { id: createLoanDto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.loan.create({
      data: {
        ...createLoanDto,
        // Prisma Client menangani konversi number ke Decimal
        amount: new Prisma.Decimal(createLoanDto.amount),
        interestRate: new Prisma.Decimal(createLoanDto.interestRate),
        status: 'pending',
      },
    });
  }

    // 2. Menyetujui Pinjaman (Logika Bisnis Utama)
    async approve(loanId: number): Promise<{ message: string }> {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
        });

        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        if (loan.status !== 'pending') {
            throw new BadRequestException('Loan is not in pending status');
        }

        const principal = Number(loan.amount);
        const monthlyRate = Number(loan.interestRate) / 100;
        const term = loan.termMonths;

        const totalInterest = principal * monthlyRate * term;
        const totalPayment = principal + totalInterest;
        const monthlyPayment = new Prisma.Decimal(totalPayment / term);

        const repayments: Prisma.LoanRepaymentCreateManyInput[] = [];

        for (let i = 1; i <= term; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i);

            repayments.push({
            loanId: loan.id,
            dueDate: dueDate,
            amountDue: monthlyPayment,
            status: 'pending',
            });
        }

        return this.prisma.$transaction(async (tx): Promise<{ message: string }> => {
            await tx.loan.update({
            where: { id: loanId },
            data: {
                status: 'approved',
                approvedDate: new Date(),
            },
            });

            await tx.loanRepayment.createMany({
            data: repayments,
            });

            return { message: 'Loan approved and repayment schedule created' };
        });
    }

  // 3. Mencairkan Pinjaman
    async disburse(loanId: number) {
        return this.prisma.loan.update({
        where: { id: loanId },
        data: {
            status: 'disbursed',
            disbursementDate: new Date(),
        },
        });
    }

  // 4. Membayar Angsuran
    async payInstallment(payRepaymentDto: PayRepaymentDto) {
        const { repaymentId, amountPaid } = payRepaymentDto;

        const repayment = await this.prisma.loanRepayment.findUnique({
        where: { id: repaymentId },
        });

        if (!repayment) {
        throw new NotFoundException('Repayment schedule not found');
        }
        if (repayment.status === 'paid') {
        throw new BadRequestException('This installment is already paid');
        }

        // TODO: Tambahkan logika untuk menangani pembayaran kurang/lebih
        // Untuk MVP, kita asumsikan pembayaran lunas
        return this.prisma.loanRepayment.update({
        where: { id: repaymentId },
        data: {
            amountPaid: new Prisma.Decimal(amountPaid),
            paidDate: new Date(),
            status: 'paid',
        },
        });
    }

  // 5. Get All Loans
    async findAll() {
        return this.prisma.loan.findMany({
        include: { member: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        });
    }

  // 6. Get Loan Detail
  async findOne(id: number) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        member: true,
        repayments: { orderBy: { dueDate: 'asc' } }, // Tampilkan angsuran terurut
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }
}