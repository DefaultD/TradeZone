import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { ProfileDto } from './dto/profile.dto';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaService } from 'src/prisma/prisma.service';
import { profiles } from '@prisma/client';
import { UploadsService } from 'src/upload/uploads.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repo: ProfileRepository,
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService
  ) { }

  /**
   * Retorna o perfil do usuário logado.
   */
  async getProfile(userId: number) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    return profile;
  }


  async getUserProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
        profile_stats: true,
        profile_badges: true,
      },
    });

    if (!user) throw new NotFoundException("Usuário não encontrado");

    // ======================================
    // LISTINGS
    // ======================================
    const listings = await this.prisma.listings.findMany({
      where: { user_id: userId, status: "active" },
      include: {
        cards: true,
        listing_images: true,
      },
      orderBy: { id: "desc" },
    });

    // ======================================
    // REVIEWS
    // ======================================
    const reviews = await this.prisma.user_reviews.findMany({
      where: { target_user_id: userId },
      include: {
        users_user_reviews_reviewer_idTousers: {
          select: {
            id: true,
            name: true,
            profiles: {
              select: { avatar_url: true }
            }
          }
        }
      },
      orderBy: { created_at: "desc" }
    });

    const ratingCount = reviews.length;
    const ratingAvg = ratingCount
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount
      : 0;

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => breakdown[r.rating]++);

    // ======================================
    // HISTÓRICO - VENDAS
    // ======================================
    const sales = await this.prisma.sales.findMany({
      where: {
        status: "completed",
        listings: {
          user_id: userId,
        },
      },
      include: {
        listings: {
          include: {
            cards: true,
            listing_images: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    // Buscar informações dos compradores
    const buyerIds = sales.map(s => s.buyer_id).filter(Boolean) as number[];
    const buyers = buyerIds.length > 0
      ? await this.prisma.users.findMany({
          where: { id: { in: buyerIds } },
          select: {
            id: true,
            name: true,
            profiles: {
              select: {
                name: true,
              },
            },
          },
        })
      : [];
    const buyersMap = new Map(buyers.map(b => [b.id, b]));

    // ======================================
    // HISTÓRICO - TROCAS
    // ======================================
    const trades = await this.prisma.trades.findMany({
      where: {
        OR: [
          { user_offer_id: userId },
          { user_receive_id: userId },
        ],
        status: "completed",
      },
      include: {
        trade_items: {
          include: {
            cards: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    // Buscar informações dos usuários das trocas
    const tradeUserIds = trades.flatMap(t => [t.user_offer_id, t.user_receive_id]).filter(id => id !== userId);
    const tradeUsers = tradeUserIds.length > 0
      ? await this.prisma.users.findMany({
          where: { id: { in: tradeUserIds } },
          select: {
            id: true,
            name: true,
            profiles: {
              select: {
                name: true,
              },
            },
          },
        })
      : [];
    const tradeUsersMap = new Map(tradeUsers.map(u => [u.id, u]));

    // ======================================
    // AVATAR + BANNER (S3)
    // ======================================
    const avatarUrl = user.profiles?.avatar_url
      ? await this.uploadsService.generateSignedUrl(user.profiles.avatar_url)
      : "/defaults/default-avatar.jpg";

    const bannerUrl = user.profiles?.banner_url
      ? await this.uploadsService.generateSignedUrl(user.profiles.banner_url)
      : "/defaults/default-banner.jpg";

    // ======================================
    // LISTINGS IMAGENS (S3)
    // ======================================
    const listingsFormatted = await Promise.all(
      listings.map(async (l) => {
        const firstImg = l.listing_images?.[0]?.fs_key;

        const thumbnail = firstImg
          ? await this.uploadsService.generateSignedUrl(firstImg)
          : "/defaults/default-card.jpg";

        return {
          id: l.id,
          title: l.cards?.name,
          price: Number(l.price),
          rarity: l.rarity,
          condition: l.condition,
          language: l.language,
          game: l.game,
          thumbnail,
          created_at: l.created_at,
        };
      })
    );

    // ======================================
    // REVIEWS (avatar com S3)
    // ======================================
    const reviewsFormatted = await Promise.all(
      reviews.map(async (r) => {
        const reviewerAvatar = r.users_user_reviews_reviewer_idTousers?.profiles?.avatar_url
          ? await this.uploadsService.generateSignedUrl(
            r.users_user_reviews_reviewer_idTousers.profiles.avatar_url
          )
          : "/defaults/default-avatar.jpg";

        return {
          id: r.id,
          rating: r.rating,
          text: r.comment,
          date: r.created_at,
          user: r.users_user_reviews_reviewer_idTousers?.name,
          avatar: reviewerAvatar,
        };
      })
    );

    // ======================================
    // HISTÓRICO - FORMATAR VENDAS E TROCAS
    // ======================================
    const historyItems: Array<{
      id: number;
      type: "venda" | "troca";
      title: string;
      createdAt: Date | null;
      date: string;
      price?: number;
      tradedFor?: string;
      partnerLabel: string;
      partnerName: string;
    }> = [];

    // Formatar vendas
    for (const sale of sales) {
      const buyer = sale.buyer_id ? buyersMap.get(sale.buyer_id) : null;
      const cardName = sale.listings?.cards?.name || "Carta";

      historyItems.push({
        id: sale.id,
        type: "venda",
        title: cardName,
        createdAt: sale.created_at,
        date: sale.created_at ? new Date(sale.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : "",
        price: sale.price ? Number(sale.price) : undefined,
        partnerLabel: "Comprador",
        partnerName: buyer?.profiles?.name || buyer?.name || "Desconhecido",
      });
    }

    // Formatar trocas
    for (const trade of trades) {
      const isOfferer = trade.user_offer_id === userId;
      const partnerId = isOfferer ? trade.user_receive_id : trade.user_offer_id;
      const partner = tradeUsersMap.get(partnerId);
      
      // Pegar os cards da troca (do lado do outro usuário)
      const otherUserItems = trade.trade_items.filter(item => item.owner_id === partnerId);
      const tradedForNames = otherUserItems
        .map(item => item.cards?.name)
        .filter(Boolean)
        .join(", ") || "Cartas";

      historyItems.push({
        id: trade.id,
        type: "troca",
        title: trade.trade_items
          .filter(item => item.owner_id === userId)
          .map(item => item.cards?.name)
          .filter(Boolean)
          .join(", ") || "Cartas",
        createdAt: trade.created_at,
        date: trade.created_at ? new Date(trade.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : "",
        tradedFor: tradedForNames,
        partnerLabel: isOfferer ? "Receptor" : "Ofertante",
        partnerName: partner?.profiles?.name || partner?.name || "Desconhecido",
      });
    }

    // Ordenar por data (mais recente primeiro) e limitar a 10 itens
    const historyLimited = historyItems
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map(({ createdAt, ...item }) => item); // Remove createdAt do retorno

    // ======================================
    // RETORNO FINAL
    // ======================================
    return {
      id: user.id,
      name: user.profiles?.name ?? user.name,
      avatar: avatarUrl,
      banner: bannerUrl,
      bio: user.profiles?.bio,
      location: user.profiles?.location,

      member_since: user.created_at,

      badges: {
        verified: user.profile_badges?.is_verified ?? false,
        top_trader: user.profile_badges?.is_top_trader ?? false,
        reliable_seller: user.profile_badges?.is_reliable_seller ?? false,
      },

      stats: {
        rating: ratingAvg,
        rating_count: ratingCount,
        listings: user.profile_stats?.listings_count ?? 0,
        trades: user.profile_stats?.trades_count ?? 0,
        response_rate: user.profile_stats?.response_rate ?? 0,
        response_time: user.profile_stats?.response_time_hours ?? 0,
        cancellations: user.profile_stats?.cancellations_count ?? 0,
        reliability: user.profile_stats?.reliability ?? 0,
      },

      listings: listingsFormatted,
      reviews: reviewsFormatted,

      reviews_summary: {
        rating: ratingAvg,
        rating_count: ratingCount,
        breakdown,
      },

      history: historyLimited,
    };
  }


  /**
   * Atualiza ou cria o perfil do usuário.
   * Usado no endpoint PUT /profile
   */
  async updateProfile(userId: number, dto: ProfileDto, tx?: PrismaClient) {
    // Evita CPF duplicado
    if (dto.cpf) {
      const existing = await this.repo.findByUserId(userId);
      if (existing && existing.cpf && existing.cpf !== dto.cpf) {
        throw new BadRequestException('CPF já vinculado a outro perfil.');
      }
    }

    return this.repo.upsertProfile(userId, dto, tx);
  }

  /**
   * Cria o perfil inicial do usuário após registro.
   * Chamado dentro do AuthService.register()
   */
  async createInitialProfile(
    userId: number,
    data?: {
      name?: string;
      bio?: string;
      avatar_url?: string;
      date_of_birth?: Date | null;
      cpf?: string;
      rg?: string;
      phone?: string;
    },
    tx?: PrismaClient
  ) {
    // 🔒 se vier data, cria com tudo; se não, cria só o mínimo
    return this.repo.createProfile({
      user_id: userId,
      name: data?.name ?? null,
      bio: data?.bio ?? null,
      avatar_url: data?.avatar_url ?? null,
      date_of_birth: data?.date_of_birth ?? null,
      cpf: data?.cpf ?? null,
      rg: data?.rg ?? null,
      phone: data?.phone ?? null,
    }, tx);
  }


  /**
   * Retorna todos os perfis (uso interno/admin)
   */
  async listAll() {
    return this.repo.listAll();
  }

  /**
   * Deleta o perfil vinculado a um usuário
   * (para quando o usuário for removido)
   */
  async deleteProfile(userId: number) {
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    await this.repo.deleteByUserId(userId);
    return { message: 'Perfil removido com sucesso.' };
  }
}
