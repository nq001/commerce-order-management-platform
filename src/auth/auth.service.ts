import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../database/entities/user-role.entity';
import { User } from '../database/entities/user.entity';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name } = registerDto;

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.create({
      email,
      password_hash,
      first_name,
      last_name,
      is_active: true,
    });

    // Assign default role
    const defaultRole = await this.usersService.getDefaultRole();
    await this.userRoleRepository.save(
      this.userRoleRepository.create({
        user: user,
        role: defaultRole,
      }),
    );

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // Validate refresh token in Redis
    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User no longer valid');
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async logout(userId: string) {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  private async generateTokens(user: User) {
    // Extract roles and permissions from eagerly loaded relations
    const roles: string[] = [];
    const permissions: string[] = [];

    if (user.userRoles) {
      for (const ur of user.userRoles) {
        if (ur.role) {
          roles.push(ur.role.name);
          if (ur.role.rolePermissions) {
            for (const rp of ur.role.rolePermissions) {
              if (rp.permission) {
                permissions.push(rp.permission.action);
              }
            }
          }
        }
      }
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles: Array.from(new Set(roles)),
      permissions: Array.from(new Set(permissions)),
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ) as any,
      },
    );

    // Calculate expiration in seconds for Redis
    const refreshExpStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    let refreshExpSeconds = 7 * 24 * 60 * 60; // 7 days fallback
    if (refreshExpStr.endsWith('d')) {
      refreshExpSeconds = parseInt(refreshExpStr) * 24 * 60 * 60;
    } else if (refreshExpStr.endsWith('h')) {
      refreshExpSeconds = parseInt(refreshExpStr) * 60 * 60;
    }

    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      refreshExpSeconds,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
