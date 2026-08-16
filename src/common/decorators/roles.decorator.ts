import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Déclare les rôles autorisés à accéder à une route ou un controller.
 * Doit être combiné avec RolesGuard (voir roles.guard.ts), qui lit cette
 * métadonnée et compare avec req.user.role.
 *
 * Usage :
 *   @Roles(Role.ADMIN)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get()
 *   findAll() { ... }
 *
 * Note : @Roles() vérifie uniquement le TYPE de rôle (Admin/Encadrant/Stagiaire).
 * Les vérifications plus fines de propriété (ex: encadrantId === req.user.id
 * pour qu'un encadrant ne voie que SES stagiaires) restent à faire dans le
 * service/controller de chaque module, au cas par cas (voir BACKEND_SPEC.md §1).
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);