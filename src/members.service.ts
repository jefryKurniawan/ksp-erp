import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateMemberDto } from './members/dto/create-member.dto';
import { UpdateMemberDto } from './members/dto/update-member.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    return this.prisma.member.create({
      data: createMemberDto,
    });
  }

  async findAll() {
    return this.prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        savingsAccount: true, // Sertakan detail rekening simpanan
        loans: {                // Sertakan riwayat pinjaman
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    try {
      return await this.prisma.member.update({
        where: { id },
        data: updateMemberDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Member with ID ${id} not found and cannot be updated.`);
      }
      throw error; 
    }
  }

  async remove(id: number) {
    try {
      const removedMember = await this.prisma.member.update({
        where: { id },
        data: { status: 'inactive' },
      });
      return removedMember;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Member with ID ${id} not found and cannot be removed.`);
      }
      throw error;
    }
  }
}
