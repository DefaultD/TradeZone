import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CardsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async search(query: string) {
        if (!query || query.trim().length < 2) return [];
        return this.prisma.cards.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            take: 10,
            select: {
                id: true,
                name: true,
                image_url: true,
                set_name: true,
            },
        });
    }
}
