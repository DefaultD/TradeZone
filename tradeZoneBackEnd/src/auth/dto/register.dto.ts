import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  // --- Dados do usuário ---
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsBoolean()
  accepted_terms: boolean;

  // --- Dados do perfil ---
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'date_of_birth deve estar em formato ISO (YYYY-MM-DD)' })
  date_of_birth?: string;

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
  @Matches(/^\+?\d{10,15}$/, { message: 'Número de telefone inválido' })
  phone?: string;
}
