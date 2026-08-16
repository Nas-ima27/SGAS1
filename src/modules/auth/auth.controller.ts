import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
}