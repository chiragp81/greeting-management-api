import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from '../../core/constants/general.constants';
import { RolesService } from '../../roles/roles.service';
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
    private roleService: RolesService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) return true;
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SECRET_KEY')
      });
      const user = await this.authService.validateUser(payload);
      const role = await this.roleService.getRoleByName(user.role);
      const permissions = role.permissions.map(item => item.name);
      return permissions.includes(requiredPermission);
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
