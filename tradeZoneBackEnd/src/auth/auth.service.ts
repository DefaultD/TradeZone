import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthRepository } from './auth.repository';
import { UserEntity } from './entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ProfileService } from 'src/profile/profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client/extension';
import * as crypto from 'crypto';

export interface GooglePayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly profileService: ProfileService,
    private readonly prisma: PrismaService, // ⬅️ Prisma injetado para transações
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private googleClient: OAuth2Client;

  /**
   * Registro de usuário com transação
   * Cria o user e o profile de forma atômica
   */
  async register(dto: RegisterDto) {
    if (!dto.email) {
      throw new BadRequestException('E-mail é obrigatório.');
    }

    const existing = await this.repo.findByEmail(dto.email.toLowerCase());
    if (existing) throw new BadRequestException('E-mail já cadastrado.');

    const user = await UserEntity.createWithPassword(dto as any);

    const refreshToken = crypto.randomBytes(64).toString('hex');
    // 🧩 Transação Prisma garante atomicidade
    const createdUser = await this.prisma.$transaction(async (tx) => {
      // Cria o usuário usando o client transacional
      const created = await this.repo.createUser(user, tx as PrismaClient);

      // Cria o profile inicial usando o mesmo client
      await this.profileService.createInitialProfile(
        created.id as number,
        {
          name: dto.name,
          bio: dto.bio,
          avatar_url: dto.avatar_url,
          date_of_birth: dto.date_of_birth
            ? new Date(dto.date_of_birth)
            : null,
          cpf: dto.cpf,
          rg: dto.rg,
          phone: dto.phone,
        },
        tx,
      );

      return created;
    });
    await this.repo.saveRefreshToken(createdUser.id!, refreshToken);

    return this.signToken(user, refreshToken);
  }

  /**
   * Login via Google OAuth2
   */
  async googleLogin(dto: GoogleLoginDto) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload() as GooglePayload;
      const { email, name, picture, sub } = payload;

      if (!payload?.email) {
        throw new UnauthorizedException('Token Google sem e-mail válido');
      }

      let user = await this.repo.findByEmail(email.toLowerCase());

      if (!user) {
        const newUser = new UserEntity({
          email,
          google_id: sub,
          password: null,
        });

        // 🔒 Transação para criar user + profile juntos
        const created = await this.prisma.$transaction(async (tx) => {
          const createdUser = await this.repo.createUser(newUser, tx as PrismaClient);
          await this.profileService.createInitialProfile(
            createdUser.id as number,
            { name },
            tx,
          );

          // Atualiza avatar, se houver
          if (picture) {
            await this.profileService.updateProfile(
              createdUser.id as number,
              { avatar_url: picture },
              tx,
            );
          }

          return createdUser;
        });

        user = created;
      }
      const refreshToken = crypto.randomBytes(64).toString('hex');
      await this.repo.saveRefreshToken(user.id!, refreshToken);

      return this.signToken(user, refreshToken);
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Google token inválido');
    }
  }

  /**
   * Login padrão com email/senha
   */
  async login(dto: LoginDto) {
    const user = await this.repo.findByEmail(dto.email.toLowerCase());
    if (!user || !user.id) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await user.validatePassword(dto.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.repo.saveRefreshToken(user.id, refreshToken);

    return this.signToken(user, refreshToken);
  }

  /**
   * Cria o JWT do usuário
   */
  private async signToken(user: UserEntity, refreshToken: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const options: JwtSignOptions = {
      secret: process.env.JWT_SECRET ?? 'fallback_secret',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES as any) ?? '15m',
    };

    const accessToken = await this.jwt.signAsync(payload, options);

    return {
      accessToken,
      user: user.toJSON(),
      refreshToken
    };
  }

  async refresh(userId: number, refreshToken: string) {
    const isValid = await this.repo.findValidRefreshToken(
      userId,
      refreshToken,
    );

    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const payload = { sub: userId };
    const newAccessToken = this.jwt.sign(payload, { expiresIn: '1h' });

    return { access_token: newAccessToken, expires_in: 3600 };
  }


  /**
   * Obtém o perfil do usuário autenticado
   */
  async getProfile(user: any) {
    const found = await this.repo.findById(user.id);
    return found?.toJSON();
  }

  /**
   * Logout simples (frontend descarta o token)
   */
  async logout(userId: number) {
    await this.repo.revokeRefreshTokens(userId);
    return { message: 'Logout realizado com sucesso' };
  }
}
