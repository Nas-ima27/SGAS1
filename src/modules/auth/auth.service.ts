import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

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
      throw new ForbiddenException('Compte désactivé.');
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
    };
  }
}