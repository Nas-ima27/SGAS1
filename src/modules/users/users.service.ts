import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { User } from '../auth/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { MailService } from '../mail/mail.service';
import { Utilisateur } from './entities/user.entity';

/** Génère un mot de passe temporaire lisible mais suffisamment aléatoire. */
function generateTempPassword(): string {
  // 12 caractères hexadécimaux — simple, pas de caractères ambigus (0/O, 1/l),
  // suffisant pour un mot de passe temporaire destiné à être changé rapidement.
  return crypto.randomBytes(6).toString('hex');
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  findAll(): Promise<Utilisateur[]> {
    return this.utilisateurRepository.find();
  }

  /**
   * POST /users
   * Crée l'entrée annuaire (Utilisateur) ET un compte de connexion (User,
   * role=Admin) dans la même opération — décision prise en conversation.
   * Envoie les identifiants générés par email via Resend (MailService).
   */
  async create(dto: CreateUtilisateurDto): Promise<Utilisateur> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const utilisateur = this.utilisateurRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      service: dto.service,
    });
    await this.utilisateurRepository.save(utilisateur);

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepository.create({
      name: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
      passwordHash,
      role: Role.ADMIN,
      encadrantId: null,
      stagiaireId: null,
      compteActif: true,
      isSuperAdmin: dto.isSuperAdmin ?? false,
    });
    await this.userRepository.save(user);

    await this.mailService.sendCredentialsEmail({
      to: dto.email,
      nom: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
      motDePasseTemporaire: tempPassword,
    });

    return utilisateur;
  }
}