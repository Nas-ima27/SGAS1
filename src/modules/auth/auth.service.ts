import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * Forme exacte attendue par le frontend en retour de connexion
 * (voir BACKEND_SPEC.md §1 — modèle AuthUser).
 *
 * - id : id de l'entité liée (Encadrant.id ou Stagiaire.id) ; 0 pour un Admin
 * - initials : calculées ici pour éviter au frontend d'avoir à le refaire
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: User['role'];
  initials: string;
  // NOUVEAU — true tant que ce compte utilise encore son mot de passe par
  // défaut prévisible (voir default-password.util.ts). Le frontend bloque
  // toute navigation hors de l'écran "Changer mon mot de passe" tant que
  // ce flag est vrai (voir ProtectedRoute.tsx).
  mustChangePassword: boolean;
}

function computeInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ user: AuthUser; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    // Message volontairement générique (ne pas révéler si c'est l'email
    // ou le mot de passe qui est incorrect — bonne pratique de sécurité).
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    // Règle §1 du spec : un compte désactivé ne doit pas pouvoir se connecter.
    if (!user.compteActif) {
      throw new ForbiddenException(
        'Compte inactif pour le moment, veuillez contacter les RH.',
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const authUser = this.toAuthUser(user);

    const token = await this.jwtService.signAsync({
      sub: authUser.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: authUser, token };
  }

  /**
   * PATCH /auth/change-password
   * Utilisable par tout compte connecté quel que soit son rôle (Admin,
   * Encadrant, Stagiaire) — nécessaire depuis que le premier mot de passe
   * est un mot de passe par défaut prévisible (2 lettres nom + 3 lettres
   * prénom + date, voir default-password.util.ts) : chaque compte doit
   * pouvoir le remplacer par un mot de passe de son choix.
   *
   * userId vient de req.user.userId (id réel dans `users`, résolu par
   * JwtStrategy), pas de req.user.id (id de l'entité métier liée).
   *
   * Retourne { mustChangePassword: false } (plutôt qu'un simple 204) pour
   * que le frontend puisse mettre à jour son AuthUser en session sans
   * devoir se reconnecter — sinon la porte de blocage (ProtectedRoute,
   * basée sur ce flag) resterait fermée jusqu'au prochain login.
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ mustChangePassword: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent de l\'actuel.',
      );
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.mustChangePassword = false;
    await this.userRepository.save(user);

    return { mustChangePassword: false };
  }

  /**
   * Construit la forme AuthUser exposée au frontend, en résolvant l'id
   * de l'entité métier liée selon le rôle (Encadrant.id, Stagiaire.id, ou 0
   * pour un Admin qui n'a pas d'entité métier associée).
   */
  private toAuthUser(user: User): AuthUser {
    const linkedEntityId = user.encadrantId ?? user.stagiaireId ?? 0;

    return {
      id: linkedEntityId,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: computeInitials(user.name),
      mustChangePassword: user.mustChangePassword,
    };
  }
}
