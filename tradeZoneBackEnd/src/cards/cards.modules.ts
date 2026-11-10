import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CardsRepository } from './cards.repository';

@Module({
  controllers: [CardsController],
  providers: [CardsService, CardsRepository,PrismaService],
  exports: [CardsService],
})
export class CardsModule {}
