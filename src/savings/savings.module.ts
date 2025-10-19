import { Module } from '@nestjs/common';
import { SavingsController } from '../savings.controller';
import { SavingsService } from '../savings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule], // Impor PrismaModule agar bisa di-inject di SavingsService
    controllers: [SavingsController],
    providers: [SavingsService],
})
export class SavingsModule {}
