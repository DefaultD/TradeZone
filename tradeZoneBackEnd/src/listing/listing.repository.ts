import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class ListingsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, dto: CreateListingDto) {
        return this.prisma.listings.create({
            data: {
                user_id: userId,
                card_id: dto.card_id, // vínculo direto com o card
                condition: dto.condition,
                rarity: dto.rarity,
                price: dto.price,
                language: `portuguese`,
                description: dto.description,
                listing_images: {
                    create: dto.images.map((fsKey) => ({
                        fs_key: fsKey,
                    })),
                },
                status: 'active',
                created_at: new Date(),
            },
            include: {
                cards: true, // caso precise retornar dados da carta
            },
        });
    }

    async findAll(filters?: Prisma.listingsWhereInput) {
        const where = {
            ...filters,
            deleted_at: null, // só anúncios ativos
        };

        const listings = await this.prisma.listings.findMany({
            where,
            include: {
                cards: true,
                users: {
                    include: { profiles: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return listings.map((l) => this.sanitizeListing(l));
    }

    async findById(id: number) {
        const listing = await this.prisma.listings.findFirst({
            where: {
                id,
                deleted_at: null, // ignora anúncios deletados
            },
            include: {
                cards: true,
                users: {
                    include: { profiles: true },
                },
            },
        });
        return listing ? this.sanitizeListing(listing) : null;
    }
    async update(id: number, data: Prisma.listingsUpdateInput) {
        const listing = await this.prisma.listings.update({
            where: { id },
            data,
            include: {
                cards: true,
                users: {
                    include: {
                        profiles: true,
                    },
                },
            },
        });
        return this.sanitizeListing(listing);
    }


    async softDelete(id: number) {
        return this.prisma.listings.update({
            where: { id },
            data: { deleted_at: new Date(), status: 'deleted' },
        });
    }

    /**
     * Remove campos sensíveis do perfil e retorna apenas dados seguros.
     */
    private sanitizeListing(listing: any) {
        if (!listing?.users?.profiles) return listing;

        const safeProfile = {
            id: listing.users.profiles.id,
            name: listing.users.profiles.name,
            avatar_url: listing.users.profiles.avatar_url,
            bio: listing.users.profiles.bio,
        };

        return {
            ...listing,
            users: {
                profile: safeProfile,
            },
        };
    }
}
