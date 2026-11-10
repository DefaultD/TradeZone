import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { UploadsService } from 'src/upload/uploads.service';
import { ListingEntity, ListingStatus } from './domain/ListingEntity';

@Injectable()
export class ListingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadsService: UploadsService,
    ) { }

    async getFilteredListings(query: any) {
        const { search, rarity, min, max, game, condition } = query;

        const conditionMap: Record<string, string> = {
            "NM": "NEAR_MINT",
            "LP": "LIGHTLY_PLAYED",
            "MP": "MODERATELY_PLAYED",
            "HP": "HEAVILY_PLAYED",
            "DMG": "DAMAGED",
        };

        const rarityMap: Record<string, string> = {
            "Comum": "COMMON",
            "Incomum": "UNCOMMON",
            "Rara": "RARE",
            "Mítica": "MYTHIC",
        };

        const gameMap: Record<string, string> = {
            "Magic": "MAGIC",
            "Pokémon": "POKEMON",
            "Yu-Gi-Oh!": "YUGIOH",
        };

        const where: any = {
            status: "active",
        };

        // nome da carta (via tabela cards)
        if (search) {
            where.cards = {
                name: { contains: search, mode: "insensitive" },
            };
        }

        if (game) {
            where.game = gameMap[game]
        }

        if (rarity) {
            where.rarity = rarityMap[rarity]; // ← AQUI A CORREÇÃO IMPORTANTE
        }

        if (condition) {
            where.condition = condition;
        }


        if (min) {
            where.price = { gte: Number(min) };
        }

        if (max) {
            where.price = { ...(where.price || {}), lte: Number(max) };
        }

        const listings = await this.prisma.listings.findMany({
            where,
            include: {
                cards: true,
                users: {
                    include: {
                        profiles: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { id: "desc" },
        });

        return listings;
    }

    // ======================================
    // CREATE
    // ======================================
    async create(userId: number, dto: CreateListingDto) {
        return this.prisma.listings.create({
            data: {
                user_id: userId,
                card_id: dto.card_id,
                condition: dto.condition,
                rarity: dto.rarity,
                language: `portuguese`,
                description: dto.description,
                price: dto.price,
                created_at: new Date(),
                listing_images: {
                    create: dto.images.map((fs_key) => ({
                        fs_key,
                    })),
                },
            },
            include: {
                cards: true,
            },
        });
    }


    async pauseListing(id: number) {
        const listing = await this.prisma.listings.findUnique({
            where: { id },
        });

        if (!listing) {
            throw new HttpException('Anúncio não encontrado', HttpStatus.NOT_FOUND);
        }

        if (listing.status === 'paused') {
            throw new HttpException(
                'O anúncio já está pausado',
                HttpStatus.BAD_REQUEST,
            );
        }

        return await this.prisma.listings.update({
            where: { id },
            data: { status: 'paused' },
        });
    }

    async activateListing(id: number) {
        const listing = await this.prisma.listings.findUnique({
            where: { id },
        });
        if (!listing) throw new HttpException('Anúncio não encontrado', HttpStatus.NOT_FOUND);


        const entity = ListingEntity.create(listing, listing.status as ListingStatus);
        entity.pause();

        return await this.prisma.listings.update({
            where: { id },
            data: { status: 'active' },
        });
    }

    async deleteListing(id: number) {
        const listing = await this.prisma.listings.findUnique({
            where: { id },
        });

        if (!listing) {
            throw new HttpException('Anúncio não encontrado', HttpStatus.NOT_FOUND);
        }

        await this.prisma.listings.delete({
            where: { id },
        });

        return { message: 'Anúncio removido com sucesso' };
    }

    // ======================================
    // FIND ALL
    // ======================================
    async findAll(filters?: any) {
        return this.prisma.listings.findMany({
            where: {
                ...filters,
                deleted_at: null,
            },
            include: {
                cards: true,
                users: {
                    include: { profiles: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    // ======================================
    // FIND ONE
    // ======================================
    async findOne(id: number) {
        const listing = await this.prisma.listings.findFirst({
            where: { id, deleted_at: null },
            include: {
                cards: true,
                users: {
                    include: { profiles: true },
                },
            },
        });

        if (!listing) throw new NotFoundException('Anúncio não encontrado');

        return listing;
    }

    // ======================================
    // UPDATE + DELETE IMAGES + UPLOAD
    // ======================================
    async update(
        id: number,
        dto: UpdateListingDto,
        newImages: Express.Multer.File[],
    ) {
        return this.prisma.$transaction(async (tx) => {
            // Checa existência
            const existing = await tx.listings.findUnique({
                where: { id },
            });

            if (!existing) throw new NotFoundException('Anúncio não encontrado');

            // 1) UPDATE BÁSICO
            await tx.listings.update({
                where: { id },
                data: {
                    condition: dto.condition,
                    rarity: dto.rarity,
                    description: dto.description,
                    price: dto.price,
                    updated_at: new Date(),
                },
            });

            // 2) DELETE IMAGES ANTIGAS
            const idsToDelete = dto.delete_images?.map(id => Number(id)) ?? [];

            if (idsToDelete.length > 0) {
                const imgs = await tx.listing_images.findMany({
                    where: { id: { in: idsToDelete }, listing_id: id },
                });

                // deletar do S3
                for (const img of imgs) {
                    if (img.fs_key) {
                        await this.uploadsService.deleteFile(img.fs_key);
                    }
                }

                await tx.listing_images.deleteMany({
                    where: { id: { in: idsToDelete }, listing_id: id },
                });
            }

            // 3) UPLOAD NOVAS IMAGENS
            if (newImages && newImages.length > 0) {
                for (const file of newImages) {
                    const uploaded = await this.uploadsService.uploadFile(file);

                    await tx.listing_images.create({
                        data: {
                            listing_id: Number(id),
                            fs_key: uploaded.fs_key
                        },
                    });
                }
            }

            // 4) RETORNO FINAL
            return tx.listings.findUnique({
                where: { id },
                include: {
                    cards: true,
                    users: { include: { profiles: true } },
                },
            });
        });
    }

    // ======================================
    // FIND BY USER
    // ======================================
    async findByUser(userId: number) {
        return this.prisma.listings.findMany({
            where: {
                user_id: userId,
                deleted_at: null,
            },
            include: {
                cards: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    // ======================================
    // SOFT DELETE
    // ======================================
    async delete(id: number, userId: number) {
        const listing = await this.prisma.listings.findUnique({
            where: { id },
        });

        if (!listing) throw new NotFoundException('Anúncio não encontrado');

        if (listing.user_id !== userId)
            throw new ForbiddenException('Sem permissão para excluir');

        return this.prisma.listings.update({
            where: { id },
            data: { deleted_at: new Date(), status: 'deleted' },
        });
    }
}
