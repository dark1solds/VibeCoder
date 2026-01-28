import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { User, UserProfile, UserRole } from "@vibecoder/types";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        listings: {
          where: { status: "PUBLISHED" },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        purchases: {
          take: 10,
          orderBy: { purchasedAt: "desc" },
        },
      },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { profile: true },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async updateProfile(
    userId: string,
    profileData: Partial<UserProfile>,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: profileData,
        },
      },
      include: { profile: true },
    });

    return this.mapToUser(user);
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { profile: true },
    });

    return this.mapToUser(user);
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          {
            profile: { displayName: { contains: query, mode: "insensitive" } },
          },
        ],
      },
      include: { profile: true },
      take: limit,
    });

    return users.map((user) => this.mapToUser(user));
  }

  private mapToUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            bio: user.profile.bio,
            avatarUrl: user.profile.avatarUrl,
            githubUrl: user.profile.githubUrl,
            twitterUrl: user.profile.twitterUrl,
            websiteUrl: user.profile.websiteUrl,
          }
        : {},
      listings: user.listings || [],
      purchases: user.purchases || [],
      reputation: {
        rating: 0, // Calculate from reviews
        totalReviews: 0, // Count from reviews
        successfulSales: 0, // Count from completed purchases
        responseTime: 0, // Calculate from message response times
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
