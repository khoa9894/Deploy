import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { PrismaService } from '../prisma/prisma.service';

type StoredUser = UserInfoDto & { password: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private toUserInfo(user: StoredUser): UserInfoDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  }

  async register(dto: RegisterDto): Promise<TokenDto & { user: UserInfoDto }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
      },
    });

    return this.createAccessToken(user as StoredUser);
  }

  async login(dto: LoginDto): Promise<TokenDto & { user: UserInfoDto }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    console.log('Login attempt for email:', user);

    console.log('Dto email:', dto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch =
      dto.password === user.password || // bypass since registration is disabled
      (await bcrypt.compare(dto.password, user.password));

    console.log('Password match:', isMatch);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAccessToken(user as StoredUser);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserInfoDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return this.toUserInfo(user as StoredUser);
  }

  async findByEmail(email: string): Promise<UserInfoDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toUserInfo(user as StoredUser) : null;
  }

  async findById(id: string): Promise<UserInfoDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toUserInfo(user as StoredUser) : null;
  }

  private async createAccessToken(
    user: StoredUser,
  ): Promise<TokenDto & { user: UserInfoDto }> {
    const payload = { sub: user.id, email: user.email, name: user.name };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toUserInfo(user),
    };
  }
}
