import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '../../modules/auth/jwt.strategy';

/**
 * Doit toujours être utilisé APRÈS JwtAuthGuard dans la liste des guards
 * (JwtAuthGuard peuple req.user, RolesGuard le lit ensuite) :
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.ADMIN)
 *
 * Si la route n'a aucun décorateur @Roles(), l'accès est autorisé par défaut
 * (aucune restriction de rôle) — seul JwtAuthGuard s'applique dans ce cas.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    return !!user && requiredRoles.includes(user.role);
  }
}