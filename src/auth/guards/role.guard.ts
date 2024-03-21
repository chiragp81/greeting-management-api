import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { MESSAGES } from 'src/core/constants/messages';
import { ROLES_KEY } from '../../core/constants/general.constants';
import { AuthService } from '../auth.service';
import { Role } from '../enum/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private jwtService: JwtService,
    private authService: AuthService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET_KEY'),
      });
      const user = await this.authService.validateUser(payload);
      const isAuthorized = requiredRoles.some((role) => user.role === role);
      if (!isAuthorized) {
        throw new UnauthorizedException(MESSAGES.UNAUTHORIZED_ACCESS);
      }
      return true;
    } catch {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED_ACCESS);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

