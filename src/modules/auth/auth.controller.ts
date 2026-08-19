import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestUser } from './jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Body   : { email, password }
   * Réponse: { user: AuthUser, token: string }
   * (voir BACKEND_SPEC.md §1)
   *
   * Pas de guard ici : c'est justement la route qui délivre le token,
   * elle doit rester accessible sans authentification préalable.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/logout
   * Réponse: 204
   * (voir BACKEND_SPEC.md §1 — "Optionnel côté backend si JWT stateless,
   * mais prévoir l'endpoint pour invalidation future")
   *
   * Le JWT étant stateless, il n'y a rien à invalider côté serveur pour
   * l'instant. Le frontend vide sessionStorage de son côté (voir
   * FRONTEND_ARCHITECTURE.md §5). Cet endpoint existe pour que le contrat
   * d'API soit stable dès maintenant si une liste de révocation de tokens
   * (ou équivalent) est ajoutée plus tard.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(): Promise<void> {
    return;
  }

  /**
   * PATCH /auth/change-password
   * Body   : { currentPassword, newPassword }
   * Réponse: { mustChangePassword: false }
   *
   * Accessible à tout compte connecté (Admin, Encadrant, Stagiaire) — pas
   * de @Roles ici, contrairement à UsersController. Ajouté pour que
   * chaque compte puisse remplacer son mot de passe par défaut prévisible
   * (voir default-password.util.ts) par un mot de passe de son choix.
   *
   * Renvoie un corps (pas juste 204) : le frontend en a besoin pour lever
   * immédiatement le blocage ProtectedRoute sans repasser par un login.
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ): Promise<{ mustChangePassword: boolean }> {
    return this.authService.changePassword(req.user.userId, dto);
  }
}