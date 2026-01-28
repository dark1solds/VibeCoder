import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { CacheService } from "../../cache/cache.service";
import { PrismaService } from "../../database/prisma.service";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "@vibecoder/types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cacheService: CacheService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Remove password from response
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    // Store refresh token in cache
    await this.cacheService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7 days
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
    bio?: string;
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new BadRequestException("Email already exists");
      }
      if (existingUser.username === userData.username) {
        throw new BadRequestException("Username already exists");
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: UserRole.USER,
        profile: {
          create: {
            displayName: userData.displayName,
            bio: userData.bio,
          },
        },
      },
      include: { profile: true },
    });

    // Remove password from response
    const { passwordHash: _, ...result } = user;

    // Auto-login after registration
    return this.login(result);
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from cache
    await this.cacheService.del(`refresh_token:${userId}`);
    await this.cacheService.deleteSession(userId);
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Check if refresh token exists in cache
    const storedToken = await this.cacheService.get(`refresh_token:${userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Generate new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    // Update refresh token in cache
    await this.cacheService.set(
      `refresh_token:${user.id}`,
      newRefreshToken,
      7 * 24 * 60 * 60, // 7 days
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            listings: true,
            purchases: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
