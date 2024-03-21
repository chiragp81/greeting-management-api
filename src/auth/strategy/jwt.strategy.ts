import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { MESSAGES } from './../../core/constants/messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('SECRET_KEY')
        });
    }

    async validate(payload: any, done: VerifiedCallback) {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            return done(
                new HttpException(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED),
                false
            );
        }

        return done(null, user, payload.iat);
    }
}
