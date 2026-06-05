import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '../common/types/current-user';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly ensuredProfiles = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  async ensureProfile(user: CurrentUser) {
    return this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        displayName: user.email?.split('@')[0] ?? 'New user',
      },
    });
  }

  async getMe(user: CurrentUser) {
    return this.ensureProfile(user);
  }

  async ensureProfileForRequest(user: CurrentUser) {
    const cachedUntil = this.ensuredProfiles.get(user.id);
    if (cachedUntil && cachedUntil > Date.now()) {
      return;
    }

    await this.ensureProfile(user);
    this.ensuredProfiles.set(user.id, Date.now() + 5 * 60_000);
  }

  async updateMe(user: CurrentUser, dto: UpdateProfileDto) {
    try {
      return await this.prisma.profile.update({
        where: { id: user.id },
        data: {
          username: dto.username,
          displayName: dto.displayName,
          avatarUrl: dto.avatarUrl,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Username is already taken');
      }
      throw error;
    }
  }

  async search(query: string, currentUserId: string) {
    const q = query.trim();

    return this.prisma.profile.findMany({
      where: {
        id: { not: currentUserId },
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
                { displayName: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: 20,
      orderBy: [{ username: 'asc' }, { displayName: 'asc' }],
    });
  }
}
