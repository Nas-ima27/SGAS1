import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { User } from '../auth/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { Utilisateur } from './entities/user.entity';
import { EmailUniquenessService } from '../../common/email-uniqueness/email-uniqueness.service';
import { generateDefaultPassword } from '../../common/utils/default-password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailUniquenessService: EmailUniquenessService,
  ) {}

  findAll(): Promise<Utilisateur[]> {
    return this.utilisateurRepository.find();
  }

  /**
   * POST /users
   * Crée l'entrée annuaire (Utilisateur) ET un compte de connexion (User,
   * role=Admin) dans la même opération — décision prise en conversation.
   *
   * CORRECTIF : mot de passe par défaut PRÉVISIBLE (2 lettres nom + 3
   * lettres prénom + date de création, JJMMAAAA — voir
   * generateDefaultPassword) au lieu d'un mot de passe aléatoire envoyé
   * uniquement par email. L'envoi par email (Resend) est désactivé pour
   * le moment (décision prise en conversation — domaine sandbox
   * onboarding@resend.dev peu fiable) : l'admin communique lui-même ce
   * mot de passe, affiché une seule fois dans la réponse (voir
   * AddUserModal.tsx). Le compte doit le changer via "Changer mon mot de
   * passe" dès sa première connexion (voir AuthService.changePassword).
   */
  async create(
    dto: CreateUtilisateurDto,
  ): Promise<Utilisateur & { tempPassword: string }> {
    const email = this.emailUniquenessService.normalize(dto.email);
    await this.emailUniquenessService.assertAvailable(email);
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const utilisateur = this.utilisateurRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      service: dto.service,
    });
    await this.utilisateurRepository.save(utilisateur);

    const tempPassword = generateDefaultPassword({
      nom: dto.lastName,
      prenom: dto.firstName,
      date: new Date(),
    });
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepository.create({
      name: `${dto.firstName} ${dto.lastName}`,
      email,
      passwordHash,
      role: Role.ADMIN,
      encadrantId: null,
      stagiaireId: null,
      compteActif: true,
      isSuperAdmin: dto.isSuperAdmin ?? false,
      // Mot de passe par défaut prévisible (voir tempPassword ci-dessus)
      // — bloque l'accès à l'app tant qu'il n'est pas changé, voir
      // AuthService.changePassword et ProtectedRoute côté frontend.
      mustChangePassword: true,
    });
    await this.userRepository.save(user);

    return { ...utilisateur, tempPassword };
  }
}
