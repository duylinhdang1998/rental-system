import { Injectable } from '@nestjs/common';
import { userRoleSchema } from '@rental/contracts';
import { PrismaService } from '../../database/prisma.service.js';
import type { CreateSessionInput, SessionRecord, SessionRepository } from './auth.types.js';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSessionInput): Promise<void> {
    await this.prisma.session.create({
      data: {
        accountId: input.user.id,
        csrfHash: input.csrfHash,
        expiresAt: input.expiresAt,
        tokenHash: input.tokenHash,
      },
    });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { tokenHash } });
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const session = await this.prisma.session.findUnique({
      include: { account: true },
      where: { tokenHash },
    });
    if (!session?.account.active) return null;
    return {
      csrfHash: session.csrfHash,
      expiresAt: session.expiresAt,
      user: {
        id: session.account.id,
        name: session.account.name,
        role: userRoleSchema.parse(session.account.role),
        username: session.account.username,
      },
    };
  }
}
