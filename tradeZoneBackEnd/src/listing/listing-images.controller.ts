import { Body, Controller, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ListingImagesService } from './listing-images.service';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('listings')
export class ListingImagesController {
  constructor(
    private readonly listingImagesService: ListingImagesService,
  ) { }

  // GET /listings/10/images
  @Get(':id/images')
  async getListingImages(@Param('id') id: string) {
    return this.listingImagesService.getImagesByListingId(Number(id));
  }

  @Post(":id/upload")
  @UseInterceptors(FilesInterceptor("files"))
  upload(
    @Param("id") id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listingImagesService.uploadImages(id, files);
  }
}
