import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // use o mesmo secret do módulo JwtModule
    });

    console.log('✅ JwtStrategy carregada com sucesso!');
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
