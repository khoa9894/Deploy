import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';
import { UserInfoDto } from './dto/user-info.dto';

type StoredUser = UserInfoDto & { password: string };

@Injectable()
export class AuthService {
  private readonly users = new Map<string, StoredUser>();

  constructor(private readonly jwtService: JwtService) {}

  private toUserInfo(user: StoredUser): UserInfoDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async register(dto: RegisterDto): Promise<TokenDto & { user: UserInfoDto }> {
    if (this.users.has(dto.email)) {
      throw new ConflictException('Email is already registered');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user: StoredUser = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      password,
      createdAt: new Date(),
    };

    this.users.set(user.email, user);

    return this.createAccessToken(user);
  }

  async login(dto: LoginDto): Promise<TokenDto & { user: UserInfoDto }> {
    const user = this.users.get(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAccessToken(user);
  }

  async validateUser(email: string, password: string): Promise<UserInfoDto | null> {
    const user = this.users.get(email);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return this.toUserInfo(user);
  }

  async findByEmail(email: string): Promise<UserInfoDto | null> {
    const user = this.users.get(email);

    return user ? this.toUserInfo(user) : null;
  }

  async findById(id: string): Promise<UserInfoDto | null> {
    const user = [...this.users.values()].find((storedUser) => storedUser.id === id);

    return user ? this.toUserInfo(user) : null;
  }

  private async createAccessToken(user: StoredUser): Promise<TokenDto & { user: UserInfoDto }> {
    const payload = { sub: user.id, email: user.email, name: user.name };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toUserInfo(user),
    };
  }
}
