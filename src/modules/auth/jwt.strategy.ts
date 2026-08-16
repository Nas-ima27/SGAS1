import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * Forme du payload signé lors du login (voir auth.service.ts → login()).
 */
export interface JwtPayload {
  sub: number;
  userId: number;
  email: string;
  role: User['role'];
}

/**
 * Ce que req.user contiendra dans tous les controllers protégés par JwtAuthGuard.
 * `id` = id de l'entité métier liée (Encadrant/Stagiaire), cohérent avec AuthUser
 * côté frontend ; `userId` = id réel dans la table `users`, utile pour les
 * guards qui doivent vérifier des données propres au compte de connexion.
 */
export interface RequestUser {
  id: number;
  userId: number;
  email: string;
  role: User['role'];
  isSuperAdmin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      // Le frontend envoie "Authorization: Bearer <token>" via l'intercepteur
      // Axios (voir BACKEND_SPEC.md §1) — c'est exactement ce que cet extracteur lit.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change_moi_en_production',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // Revérifie l'existence et l'état du compte à chaque requête (pas seulement
    // au login) : si le compte a été désactivé ou supprimé entre-temps, le
    // token doit cesser d'être valide immédiatement plutôt que d'attendre son expiration.
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    if (!user.compteActif) {
      throw new UnauthorizedException('Compte désactivé.');
    }

    return {
      id: payload.sub,
      userId: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}