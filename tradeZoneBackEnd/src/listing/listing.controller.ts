import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Patch,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListingsService } from './listing.service';
import { ListingImagesService } from './listing-images.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('listings')
export class ListingsController {
    constructor(private readonly service: ListingsService,
        private readonly listingImagesService: ListingImagesService,
    ) { }

    @Patch(':id/pause')
    async pauseListing(@Param('id') id: string) {
        const listingId = Number(id);
        if (isNaN(listingId)) {
            throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
        }

        return await this.service.pauseListing(listingId);
    }

    @Patch(':id/activate')
    async activateListing(@Param('id') id: string) {
        const listingId = Number(id);
        if (isNaN(listingId)) {
            throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
        }

        return await this.service.activateListing(listingId);
    }

    @Delete(':id')
    async deleteListing(@Param('id') id: string) {
        const listingId = Number(id);
        if (isNaN(listingId)) {
            throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
        }

        return await this.service.deleteListing(listingId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/me')
    async findMyListings(@CurrentUser() user: any) {
        const listings = await this.service.findByUser(user.id);

        // Para cada listing, buscar as imagens e incluir dentro do objeto
        const listingsWithImages = await Promise.all(
            listings.map(async (l: any) => {
                const images = await this.listingImagesService.getImagesByListingId(l.id);
                return { ...l, images };
            })
        );

        return listingsWithImages;
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
        return this.service.create(user.id, dto);
    }

    @Get()
    async findAllFiltered(@Query() query: any) {
        const listings = await this.service.getFilteredListings(query);


        const listingsWithImages = await Promise.all(
            listings.map(async (l: any) => {
                const images = await this.listingImagesService.getImagesByListingId(l.id);

                return {
                    ...l,
                    images: images.map((img: any) => img.url)
                };
            })
        );

        return listingsWithImages;
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.service.findOne(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(
        FilesInterceptor('files', 10) // até 10 imagens
    )
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateListingDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        const updated = await this.service.update(
            Number(id),
            dto,
            files
        );

        const images = await this.listingImagesService.getImagesByListingId(Number(id));

        return { ...updated, images };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: number, @CurrentUser() user: any) {
        return this.service.delete(Number(id), user.id);
    }


}
