import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateAccountDto } from './savings/dto/create-account.dto';
import { TransactionDto } from './savings/dto/transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SavingsService {
  constructor(private prisma: PrismaService) {}

  // 1. Membuat Rekening Baru
  async createAccount(createAccountDto: CreateAccountDto) {
    // Schema prisma sudah menangani unique constraint untuk memberId
    return this.prisma.savingsAccount.create({
      data: {
        memberId: createAccountDto.memberId,
        accountNumber: createAccountDto.accountNumber,
        balance: new Prisma.Decimal(0), // Saldo awal
      },
    });
  }

  // 2. Setor Tunai (Deposit)
  async deposit(transactionDto: TransactionDto) {
    const { accountId, amount, description } = transactionDto;
    const amountDecimal = new Prisma.Decimal(amount);

    // Gunakan Transaksi Database
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Saldo (atomic increment)
      const account = await tx.savingsAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amountDecimal,
          },
        },
      });

      // 2. Catat Transaksi
      await tx.savingsTransaction.create({
        data: {
          accountId: accountId,
          amount: amountDecimal,
          type: 'deposit',
          date: new Date(),
          description: description,
        },
      });

      return account; // Kembalikan saldo terbaru
    });
  }

  // 3. Tarik Tunai (Withdrawal)
  async withdraw(transactionDto: TransactionDto) {
    const { accountId, amount, description } = transactionDto;
    const amountDecimal = new Prisma.Decimal(amount);

    // Gunakan Transaksi Database
    return this.prisma.$transaction(async (tx) => {
      // Validasi Saldo
      const account = await tx.savingsAccount.findUnique({
        where: { id: accountId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      if (Number(account.balance) < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 1. Update Saldo (atomic decrement)
      const updatedAccount = await tx.savingsAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amountDecimal,
          },
        },
      });

      // 2. Catat Transaksi
      await tx.savingsTransaction.create({
        data: {
          accountId: accountId,
          amount: amountDecimal,
          type: 'withdrawal',
          date: new Date(),
          description: description,
        },
      });

      return updatedAccount; // Kembalikan saldo terbaru
    });
  }

  // 4. Get Detail Rekening (termasuk riwayat transaksi)
  async findAccountById(id: number) {
    const account = await this.prisma.savingsAccount.findUnique({
      where: { id },
      include: {
        member: { select: { name: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  // 5. Get Semua Rekening
  async findAllAccounts() {
    return this.prisma.savingsAccount.findMany({
      include: { member: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
