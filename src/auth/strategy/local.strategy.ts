import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { MESSAGES } from './../../core/constants/messages';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(payload: any) {
        const user = await this.authService.validateUser(payload.email);

        if (!user) {
            throw new HttpException(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
        }

        return user;
    }
}
