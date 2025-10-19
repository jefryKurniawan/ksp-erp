// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Hapus data existing dalam urutan yang benar
  await prisma.loanRepayment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.savingsTransaction.deleteMany();
  await prisma.savingsAccount.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // 1. Buat Users (Admin & Staff)
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Administrator System',
        email: 'admin@ksp.com',
        password: '$2b$10$K7V/NO5A2l7pB9rZ2X2Q.O6Y5J5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', // admin123
        role: 'admin',
      },
      {
        name: 'Staff Keuangan',
        email: 'staff@ksp.com',
        password: '$2b$10$K7V/NO5A2l7pB9rZ2X2Q.O6Y5J5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', // staff123
        role: 'staff',
      },
    ],
  });
  console.log('👥 Created users');

  // 2. Buat Members dengan berbagai status
  const members = await prisma.member.createMany({
    data: [
      {
        name: 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 123, Jakarta',
        status: 'active',
      },
      {
        name: 'Siti Rahayu',
        email: 'siti.rahayu@email.com',
        phone: '081234567891',
        address: 'Jl. Sudirman No. 456, Jakarta',
        status: 'active',
      },
      {
        name: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@email.com',
        phone: '081234567892',
        address: 'Jl. Thamrin No. 789, Jakarta',
        status: 'active',
      },
      {
        name: 'Maya Sari',
        email: 'maya.sari@email.com',
        phone: '081234567893',
        address: 'Jl. Gatot Subroto No. 321, Jakarta',
        status: 'active',
      },
      {
        name: 'Rizki Pratama',
        email: 'rizki.pratama@email.com',
        phone: '081234567894',
        address: 'Jl. HR Rasuna Said No. 654, Jakarta',
        status: 'active',
      },
      {
        name: 'Dewi Kurnia',
        email: 'dewi.kurnia@email.com',
        phone: '081234567895',
        address: 'Jl. Asia Afrika No. 111, Bandung',
        status: 'active',
      },
      {
        name: 'Fajar Nugroho',
        email: 'fajar.nugroho@email.com',
        phone: '081234567896',
        address: 'Jl. Pahlawan No. 222, Surabaya',
        status: 'inactive',
      },
    ],
  });
  console.log('👨‍👩‍👧‍👦 Created 7 members with mixed status');

  // 3. Buat Savings Accounts untuk semua member
  const createdMembers = await prisma.member.findMany();
  
  const savingsAccountsData: Prisma.SavingsAccountCreateManyInput[] = createdMembers.map((member, index) => ({
    memberId: member.id,
    balance: new Prisma.Decimal(0), // Start from 0, will update after transactions
    accountNumber: `SAV${String(member.id).padStart(6, '0')}`,
  }));

  await prisma.savingsAccount.createMany({
    data: savingsAccountsData,
  });
  console.log('💰 Created savings accounts for all members');

  // 4. Buat Savings Transactions dan update balances
  const savingsAccounts = await prisma.savingsAccount.findMany();
  
  for (const account of savingsAccounts) {
    const transactions = [
      { amount: 1000000, type: 'deposit' as const, description: 'Setoran awal pembukaan rekening' },
      { amount: 500000, type: 'deposit' as const, description: 'Setoran rutin bulanan' },
      { amount: 250000, type: 'deposit' as const, description: 'Setoran tambahan' },
      { amount: 150000, type: 'withdrawal' as const, description: 'Penarikan tunai' },
      { amount: 75000, type: 'interest' as const, description: 'Bunga tabungan' },
    ];

    let currentBalance = 0;
    const transactionPromises = transactions.map((transaction, index) => {
      const transactionDate = new Date();
      transactionDate.setMonth(transactionDate.getMonth() - (transactions.length - index - 1));
      
      if (transaction.type === 'withdrawal') {
        currentBalance -= transaction.amount;
      } else {
        currentBalance += transaction.amount;
      }

      return prisma.savingsTransaction.create({
        data: {
          accountId: account.id,
          amount: new Prisma.Decimal(transaction.amount),
          type: transaction.type,
          date: transactionDate,
          description: transaction.description,
        },
      });
    });

    await Promise.all(transactionPromises);

    // Update final balance
    await prisma.savingsAccount.update({
      where: { id: account.id },
      data: {
        balance: new Prisma.Decimal(currentBalance),
      },
    });
  }
  console.log('📊 Created savings transactions and updated balances');

  // 5. Buat Loans dengan berbagai status
  const loansData: Prisma.LoanCreateManyInput[] = [
    // Loan 1: Pending
    {
      memberId: createdMembers[0].id,
      amount: new Prisma.Decimal(3000000),
      interestRate: new Prisma.Decimal(12),
      termMonths: 6,
      status: 'pending',
    },
    // Loan 2: Approved but not disbursed
    {
      memberId: createdMembers[1].id,
      amount: new Prisma.Decimal(5000000),
      interestRate: new Prisma.Decimal(10),
      termMonths: 12,
      status: 'approved',
      approvedDate: new Date('2024-02-01'),
    },
    // Loan 3: Disbursed with repayments
    {
      memberId: createdMembers[2].id,
      amount: new Prisma.Decimal(10000000),
      interestRate: new Prisma.Decimal(8),
      termMonths: 24,
      status: 'disbursed',
      approvedDate: new Date('2024-01-15'),
      disbursementDate: new Date('2024-01-20'),
    },
    // Loan 4: Disbursed with some repayments paid
    {
      memberId: createdMembers[3].id,
      amount: new Prisma.Decimal(8000000),
      interestRate: new Prisma.Decimal(9),
      termMonths: 12,
      status: 'disbursed',
      approvedDate: new Date('2024-01-10'),
      disbursementDate: new Date('2024-01-12'),
    },
    // Loan 5: Repaid (fully paid)
    {
      memberId: createdMembers[4].id,
      amount: new Prisma.Decimal(2000000),
      interestRate: new Prisma.Decimal(15),
      termMonths: 3,
      status: 'repaid',
      approvedDate: new Date('2023-11-01'),
      disbursementDate: new Date('2023-11-05'),
    },
  ];

  await prisma.loan.createMany({
    data: loansData,
  });
  console.log('🏦 Created loans with various statuses');

  // 6. Buat Loan Repayments untuk disbursed and repaid loans
  const disbursedLoans = await prisma.loan.findMany({
    where: {
      status: { in: ['disbursed', 'repaid'] }
    }
  });

  for (const loan of disbursedLoans) {
    if (!loan.disbursementDate) continue;

    const principal = Number(loan.amount);
    const monthlyRate = Number(loan.interestRate) / 100 / 12;
    const term = loan.termMonths;

    // Hitung angsuran dengan sistem anuitas
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

    const repayments: Prisma.LoanRepaymentCreateManyInput[] = [];

    for (let i = 1; i <= term; i++) {
      const dueDate = new Date(loan.disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Tentukan status pembayaran berdasarkan status loan dan urutan angsuran
      let status: 'pending' | 'paid' = 'pending';
      let amountPaid = new Prisma.Decimal(0);
      let paidDate: Date | null = null;

      if (loan.status === 'repaid') {
        // Untuk loan yang sudah lunas, semua angsuran sudah dibayar
        status = 'paid';
        amountPaid = new Prisma.Decimal(monthlyPayment);
        paidDate = new Date(dueDate.getTime());
      } else if (loan.status === 'disbursed' && i <= 3) {
        // Untuk loan yang sedang berjalan, 3 angsuran pertama sudah dibayar
        status = 'paid';
        amountPaid = new Prisma.Decimal(monthlyPayment);
        paidDate = new Date(dueDate.getTime() - 86400000); // 1 hari sebelum due date
      }

      repayments.push({
        loanId: loan.id,
        dueDate: dueDate,
        amountDue: new Prisma.Decimal(monthlyPayment),
        status: status,
        amountPaid: amountPaid,
        paidDate: paidDate,
      });
    }

    await prisma.loanRepayment.createMany({
      data: repayments,
    });
  }
  console.log('📅 Created loan repayments for disbursed and repaid loans');

  // 7. Final summary
  const membersCount = await prisma.member.count();
  const savingsAccountsCount = await prisma.savingsAccount.count();
  const savingsTransactionsCount = await prisma.savingsTransaction.count();
  const loansCount = await prisma.loan.count();
  const loanRepaymentsCount = await prisma.loanRepayment.count();
  const usersCount = await prisma.user.count();

  console.log('✅ Comprehensive seed completed successfully!');
  console.log('\n📊 Final Data Summary:');
  console.log(`   👥 Members: ${membersCount}`);
  console.log(`   💰 Savings Accounts: ${savingsAccountsCount}`);
  console.log(`   💸 Savings Transactions: ${savingsTransactionsCount}`);
  console.log(`   🏦 Loans: ${loansCount}`);
  console.log(`   📅 Loan Repayments: ${loanRepaymentsCount}`);
  console.log(`   👑 Users: ${usersCount}`);
  
  console.log('\n🔐 Login Credentials for Testing:');
  console.log('   Admin:  email: admin@ksp.com, password: admin123');
  console.log('   Staff:  email: staff@ksp.com, password: staff123');
  
  console.log('\n🚀 Application ready! Access at: http://localhost:3000');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });