import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { PrismaClient, user_role_enum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) { }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = addDays(new Date(), 15); // 15 dias

    await this.prisma.refresh_tokens.create({
      data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
    });
  }

  async findValidRefreshToken(userId: number, token: string): Promise<boolean> {
    const tokens = await this.prisma.refresh_tokens.findMany({
      where: { user_id: userId, revoked: false, expires_at: { gt: new Date() } },
    });

    for (const rt of tokens) {
      const match = await bcrypt.compare(token, rt.token_hash);
      if (match) return true;
    }

    return false;
  }

  async revokeRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refresh_tokens.updateMany({
      where: { user_id: userId, revoked: false },
      data: { revoked: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) return null;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        id,
        email,
        password,
        role,
        accepted_terms,
        terms_accepted_at,
        apple_id,
        created_at,
        updated_at
      FROM app.users
      WHERE email = ${email}
      LIMIT 1;
    `;

    return result.length > 0 ? new UserEntity(result[0]) : null;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
    return user ? new UserEntity(user as any) : null;
  }
  async createUser(user: UserEntity, tx?: PrismaClient): Promise<UserEntity> {
    const client = tx ?? this.prisma;

    const created = await client.users.create({
      data: {
        email: user.email,
        password: user.password,
        role: user.role as user_role_enum,
        accepted_terms: user.accepted_terms ?? false,
        terms_accepted_at: user.terms_accepted_at ?? null,
        apple_id: user.apple_id ?? null,
        created_at: user.created_at ?? new Date(),
        updated_at: user.updated_at ?? new Date(),
      },
    });

    return new UserEntity(created as any);
  }
}
