import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';

import { EXPIRY_OPTIONS } from './../core/constants/general.constants';
import { UsersService } from './../users/users.service';
import { PayloadDTO } from './dto/payload.dto';

@Global()
@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService,
        private userService: UsersService
    ) { }

    async signPayload(payload: PayloadDTO) {
        return sign(payload, this.configService.get<string>('SECRET_KEY'), EXPIRY_OPTIONS);
    }

    async validateUser(payload: PayloadDTO) {
        return await this.userService.findByPayload(payload);
    }
}
