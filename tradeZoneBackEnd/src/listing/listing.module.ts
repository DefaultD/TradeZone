import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsController } from './listing.controller';
import { ListingsRepository } from './listing.repository';
import { ListingsService } from './listing.service';
import { ListingImagesService } from './listing-images.service';
import { UploadsService } from 'src/upload/uploads.service';
import { ListingImagesController } from './listing-images.controller';

@Module({
  controllers: [ListingsController, ListingImagesController],
  providers: [ListingsService, ListingsRepository, PrismaService, ListingImagesService, UploadsService],
  exports: [ListingsService, ListingImagesService, UploadsService],
})
export class ListingsModule {}
