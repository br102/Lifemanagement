import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly singleUserEmail = process.env.SINGLE_USER_EMAIL ?? 'borja@lifemanagement.local';
  private readonly singleUserPassword = process.env.SINGLE_USER_PASSWORD ?? '22Comida79';

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (dto.email !== this.singleUserEmail) {
      throw new UnauthorizedException('Only the configured app user can register');
    }
    if (dto.password !== this.singleUserPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      return this.issueTokens(existing.id, existing.email);
    }

    const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
    const user = await this.prisma.user.create({ data: { email: dto.email, passwordHash } });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    if (dto.email !== this.singleUserEmail) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (dto.password !== this.singleUserPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.ensureSingleUser();
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(this.singleUserPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');
    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m' });
    const refreshToken = await this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' });
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) } });
    return { accessToken, refreshToken };
  }

  private async ensureSingleUser() {
    const existing = await this.prisma.user.findUnique({ where: { email: this.singleUserEmail } });
    if (existing) {
      const alreadyMatches = await bcrypt.compare(this.singleUserPassword, existing.passwordHash);
      if (alreadyMatches) return existing;

      const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash },
      });
    }
    const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
    return this.prisma.user.create({ data: { email: this.singleUserEmail, passwordHash } });
  }
}
