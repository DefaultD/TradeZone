import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifySellerDto {
  @IsNotEmpty()
  @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: 'CPF inválido' })
  cpf: string;

  @IsNotEmpty()
  @IsString()
  rg: string;

  @IsDateString()
  date_of_birth: string; // reforçado por segurança
}
