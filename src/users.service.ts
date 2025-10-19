import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

// Fungsi helper untuk mengecualikan field dari objek
function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[],
): Omit<User, Key> {
  for (const key of keys) {
    delete user[key];
  }
  return user;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;

    // 1. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // 2. Simpan ke database
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'staff',
        },
      });

      // 3. Kembalikan data user TANPA password
      return exclude(user, ['password']);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Error code P2002 adalah unique constraint violation (email)
        if (e.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw e;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
    // Kembalikan array user tanpa password
    return users.map((user) => exclude(user, ['password']));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      return exclude(user, ['password']);
    }
    return null;
  }

  // Nanti Anda akan butuh ini untuk login
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
