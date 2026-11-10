import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CardsRepository } from './cards.repository';

@Injectable()
export class CardsService {
 
  constructor(private readonly repo: CardsRepository) {}

  async search(query: string) {
    return await this.repo.search(query)
  }
}
