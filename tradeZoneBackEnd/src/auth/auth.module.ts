import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProfileModule } from 'src/profile/profile.module';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule, // ✅ caso o repo use o PrismaService
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '1h' },
    }),
    ProfileModule, // ✅ permite AuthService usar ProfileService
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    {
      provide: OAuth2Client, // ✅ provider para login com Google
      useFactory: () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID),
    },
  ],
  exports: [
    PassportModule,
    JwtStrategy,
    JwtModule, // ✅ exporta o JWT se outros módulos precisarem (boa prática)
  ],
})
export class AuthModule {}
