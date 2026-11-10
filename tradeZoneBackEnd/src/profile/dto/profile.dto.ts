import {
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  IsBoolean,
  Matches,
} from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'date_of_birth deve estar em formato ISO (YYYY-MM-DD)' })
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos numéricos' })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  rg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+?\d{8,15}$/, { message: 'Telefone deve conter apenas números e opcionalmente o + e DDI' })
  phone?: string;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;
}
