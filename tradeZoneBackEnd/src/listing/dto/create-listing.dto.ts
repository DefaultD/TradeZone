import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsEnum,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export enum ListingCondition {
  NM = 'NM',
  LP = 'LP',
  MP = 'MP',
  HP = 'HP',
}

export enum ListingRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  MYTHIC = 'MYTHIC',
}

export class CreateListingDto {
  @IsNumber()
  @IsNotEmpty()
  card_id: number;

  @IsEnum(ListingCondition)
  condition: ListingCondition;

  @IsEnum(ListingRarity)
  rarity: ListingRarity;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  language?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  images: string[]; // fs_keys das imagens enviadas no upload
}
