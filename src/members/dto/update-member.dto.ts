import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  status?: string; // 'active' atau 'inactive'
}
