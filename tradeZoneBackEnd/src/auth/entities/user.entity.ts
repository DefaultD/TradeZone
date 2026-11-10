import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { user_role_enum } from '@prisma/client';
import { error } from 'console';

export class UserEntity {
  id?: number;
  name: string;
  email: string | null;
  password: string | null;
  role?: user_role_enum;
  google_id?: string;
  date_of_birth?: Date | null;
  accepted_terms: boolean;
  terms_accepted_at?: Date | null;
  cpf?: string | null;
  rg?: string | null;
  phone?: string | null;
  phone_verified?: boolean;
  apple_id?: string | null;
  avatar_url?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  // ----------------------------
  // 🔍 Validação de dados
  // ----------------------------
  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new BadRequestException('Nome inválido (mínimo 2 caracteres).');
    }

    if (!this.email || !this.email.includes('@')) {
      throw new BadRequestException('E-mail inválido.');
    }

    if (!this.password || this.password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres.');
    }

    if (!this.date_of_birth) {
      throw new BadRequestException('Data de nascimento é obrigatória.');
    }

    const age = this.calculateAge(this.date_of_birth);
    if (age < 18) {
      throw new BadRequestException('É necessário ter pelo menos 18 anos para se cadastrar.');
    }

    if (!this.phone || !/^\+?\d{10,15}$/.test(this.phone)) {
      throw new BadRequestException('Telefone inválido.');
    }

    if (!this.accepted_terms) {
      throw new BadRequestException('É necessário aceitar os termos de uso.');
    }
  }

  private calculateAge(date: Date): number {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  // ----------------------------
  // 🔑 Criação com hash de senha
  // ----------------------------
  static async createWithPassword(data: {
    name: string;
    email: string;
    password: string;
    date_of_birth: string;
    phone: string;
    accepted_terms: boolean;
  }): Promise<UserEntity> {
    const user = new UserEntity({
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      password: data.password,
      date_of_birth: new Date(data.date_of_birth),
      phone: data.phone,
      accepted_terms: data.accepted_terms,
      terms_accepted_at: data.accepted_terms ? new Date() : null,
      role: 'user',
      phone_verified: false,
    });

    user.validate();

    if (!user.password) {
      throw new error('Por favor, digite uma senha')
    }
    const hashed = await bcrypt.hash(user.password, 10);
    user.password = hashed;

    return user;
  }

  // ----------------------------
  // 🔐 Validação de senha
  // ----------------------------
  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) {
      throw new error('Por favor, digite uma senha')
    }
    return bcrypt.compare(password, this.password);
  }

  // ----------------------------
  // 🚫 Remover senha no retorno
  // ----------------------------
  toJSON() {
    const { password, ...safe } = this;
    return safe;
  }
}
