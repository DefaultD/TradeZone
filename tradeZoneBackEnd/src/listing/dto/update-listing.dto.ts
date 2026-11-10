import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateListingDto {
    @IsEnum(['NM', 'LP', 'MP', 'HP'])
    condition: 'NM' | 'LP' | 'MP' | 'HP';

    @IsEnum(['COMMON', 'UNCOMMON', 'RARE', 'MYTHIC'])
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'MYTHIC';

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsOptional()
    delete_images?: number[];
}
