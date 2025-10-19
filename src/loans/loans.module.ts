import { Module } from '@nestjs/common';
import { LoansController } from '../loans.controller';
import { LoansService } from '../loans.service';
// Kita juga perlu mengimpor PrismaModule agar LoansService bisa menggunakannya
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule], // Impor modul apa pun yang dibutuhkan oleh service di sini
    controllers: [LoansController], // Daftarkan controller
    providers: [LoansService],      // Daftarkan service sebagai provider
})
export class LoansModule {}
