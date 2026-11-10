import { Controller, Get, Query } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.service.search(q);
  }
}
