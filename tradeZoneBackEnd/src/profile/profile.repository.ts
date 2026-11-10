import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient, profiles } from '@prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Busca um perfil pelo ID do perfil.
   */
  async findById(id: number): Promise<profiles | null> {
    return this.prisma.profiles.findUnique({ where: { id } });
  }

  /**
   * Busca um perfil pelo ID do usuário.
   */
  async findByUserId(userId: number): Promise<profiles | null> {
    return this.prisma.profiles.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Cria um novo perfil para o usuário.
   */
  async createProfile(
    data: {
      user_id: number;
      name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      date_of_birth?: Date | null;
      cpf?: string | null;
      rg?: string | null;
      phone?: string | null;
    },
    tx?: PrismaClient, // ✅ client opcional da transação
  ): Promise<profiles> {
    const client = tx ?? this.prisma; // usa o client da transação se existir

    const created = await client.profiles.create({ data });
    return created;
  }

  /**
   * Atualiza os dados de um perfil existente.
   */
  async updateProfile(userId: number, data: Partial<profiles>): Promise<profiles> {
    return this.prisma.profiles.update({
      where: { user_id: userId },
      data,
    });
  }

  /**
   * Faz um upsert (cria se não existir, atualiza se já existir).
   */
  async upsertProfile(userId: number, data: Partial<profiles>, tx?: PrismaClient): Promise<profiles> {
    const client = tx ?? this.prisma; // usa o client da transação se existir
    return client.profiles.upsert({
      where: { user_id: userId },
      update: data,
      create: { user_id: userId, ...data },
    });
  }

  /**
   * Deleta o perfil de um usuário.
   */
  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.profiles.delete({
      where: { user_id: userId },
    });
  }

  /**
   * Lista todos os perfis (útil para admin ou debugging)
   */
  async listAll(): Promise<profiles[]> {
    return this.prisma.profiles.findMany({
      orderBy: { created_at: 'desc' },
    });
  }
}
