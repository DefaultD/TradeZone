import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../upload/uploads.service';

@Injectable()
export class ListingImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService
  ) { }

  async uploadImages(listingId: number, files: Express.Multer.File[]) {
    const uploaded: {
        id: number,
        fs_key: string,
        url: string, // pública ou assinada
      }[] = [];

    for (const file of files) {
      const { fs_key, url } = await this.uploadsService.uploadFile(file);

      const saved = await this.prisma.listing_images.create({
        data: {
          listing_id: Number(listingId),
          fs_key,
        },
      });

      uploaded.push({
        id: saved.id,
        fs_key,
        url, // pública ou assinada
      });
    }

    return uploaded;
  }

  async getImagesByListingId(listingId: number) {
    const images = await this.prisma.listing_images.findMany({
      where: { listing_id: listingId },
      orderBy: { id: 'asc' }, // opcional
    });

    return Promise.all(
      images.map(async (img) => ({
        id: img.id,
        fs_key: img.fs_key,
        url: await this.uploadsService.generateSignedUrl(img.fs_key) // 🔥 URL completa
      })),
    );
  }
}
