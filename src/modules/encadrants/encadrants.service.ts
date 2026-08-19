import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Encadrant } from './entities/encadrant.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { StagiaireStatut } from '../stagiaires/enums/stagiaire-statut.enum';
import { CreateEncadrantDto } from './dto/create-encadrant.dto';
import { UpdateEncadrantDto } from './dto/update-encadrant.dto';
import { EmailUniquenessService } from '../../common/email-uniqueness/email-uniqueness.service';
import { UpdateEncadrantProfileDto } from './dto/update-encadrant-profile.dto';
import { User } from '../auth/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { generateDefaultPassword, splitPrenomNom } from '../../common/utils/default-password.util';
/** Forme exacte attendue par le frontend (voir BACKEND_SPEC.md §4). */
export type EncadrantWithStats = Encadrant & {
  stagiairesActifs: number;
  totalEncadres: number;
  sujetsProposes: number;
};

@Injectable()
export class EncadrantsService {
  constructor(
    @InjectRepository(Encadrant)
    private readonly encadrantRepository: Repository<Encadrant>,
    // Repository sur l'entité Stagiaire, importée directement depuis le
    // module stagiaires (voir encadrants.module.ts) plutôt que d'injecter
    // StagiairesService entier — on n'a besoin ici que de COUNT, pas de
    // la logique métier complète de ce service.
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailUniquenessService: EmailUniquenessService,
  ) {}

  async findAll(): Promise<EncadrantWithStats[]> {
    const encadrants = await this.encadrantRepository.find();
    return Promise.all(encadrants.map((e) => this.withStats(e)));
  }
  /**
 * PATCH /encadrants/:id/profile
 * L'Encadrant modifie son propre téléphone. Vérification de propriété
 * (req.user.id === id) faite dans le controller.
 */
async updateProfile(id: number, dto: UpdateEncadrantProfileDto): Promise<EncadrantWithStats> {
  const encadrant = await this.encadrantRepository.findOne({ where: { id } });
  if (!encadrant) {
    throw new NotFoundException(`Encadrant ${id} introuvable.`);
  }
  Object.assign(encadrant, dto);
  const saved = await this.encadrantRepository.save(encadrant);
  return this.withStats(saved);
}

  async findOne(id: number): Promise<EncadrantWithStats> {
    const encadrant = await this.encadrantRepository.findOne({ where: { id } });
    if (!encadrant) {
      throw new NotFoundException(`Encadrant ${id} introuvable.`);
    }
    return this.withStats(encadrant);
  }

  /**
   * CORRECTIF : crée aussi le compte de connexion (User, role=Encadrant)
   * lié à cette fiche — auparavant absent : seul le seed de démo créait un
   * compte pour un Encadrant (karima.alaoui@sgas.ma), un Encadrant ajouté
   * via l'UI n'avait donc aucun moyen de se connecter.
   *
   * Mot de passe par défaut PRÉVISIBLE (2 lettres nom + 3 lettres prénom +
   * date de création du compte, JJMMAAAA — pas de date "métier" équivalente
   * à un dateDebut de stage ici — voir generateDefaultPassword), renvoyé
   * une seule fois dans la réponse (`tempPassword`) pour que l'admin le
   * communique (pas d'email automatique, voir UsersService.create).
   */
  async create(dto: CreateEncadrantDto): Promise<EncadrantWithStats & { tempPassword: string }> {
    const email = this.emailUniquenessService.normalize(dto.email);
    await this.emailUniquenessService.assertAvailable(email);
    const encadrant = this.encadrantRepository.create({
      ...dto,
      email,
      compteActif: true,
    });
    const saved = await this.encadrantRepository.save(encadrant);

    const { prenom, nom } = splitPrenomNom(saved.name);
    const tempPassword = generateDefaultPassword({ nom, prenom, date: new Date() });
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepository.create({
      name: saved.name,
      email,
      passwordHash,
      role: Role.ENCADRANT,
      encadrantId: saved.id,
      stagiaireId: null,
      compteActif: true,
      // Mot de passe par défaut prévisible (voir tempPassword ci-dessus)
      // — bloque l'accès à l'app tant qu'il n'est pas changé, voir
      // AuthService.changePassword et ProtectedRoute côté frontend.
      mustChangePassword: true,
    });
    await this.userRepository.save(user);

    const withStats = await this.withStats(saved);
    return { ...withStats, tempPassword };
  }

  async update(id: number, dto: UpdateEncadrantDto): Promise<EncadrantWithStats> {
    const encadrant = await this.encadrantRepository.findOne({ where: { id } });
    if (!encadrant) {
      throw new NotFoundException(`Encadrant ${id} introuvable.`);
    }
    if (dto.email) {
      dto.email = this.emailUniquenessService.normalize(dto.email);
      await this.emailUniquenessService.assertAvailable(dto.email, {
        entity: 'encadrant',
        id,
      });
    }
    Object.assign(encadrant, dto);
    const saved = await this.encadrantRepository.save(encadrant);
    return this.withStats(saved);
  }

  /**
   * Calcule les 3 champs dérivés (§4 : "valeurs calculées, pas stockées —
   * à recalculer côté backend à chaque lecture").
   *
   * sujetsProposes utilise du SQL brut sur "sujets" car le module sujets
   * n'existe pas encore (même approche que affecterEncadrant dans
   * stagiaires.service.ts) — cette requête échouera tant que la table
   * "sujets" n'existe pas en base ; à remplacer par un vrai repository
   * une fois le module sujets construit.
   */
  private async withStats(encadrant: Encadrant): Promise<EncadrantWithStats> {
    const [stagiairesActifs, totalEncadres, sujetsProposesRows] = await Promise.all([
      this.stagiaireRepository.count({
        where: { encadrantId: encadrant.id, statut: StagiaireStatut.EN_COURS },
      }),
      this.stagiaireRepository.count({ where: { encadrantId: encadrant.id } }),
      this.encadrantRepository.manager
        .query('SELECT COUNT(*) AS count FROM sujets WHERE "encadrantId" = $1', [encadrant.id])
        .catch(() => [{ count: '0' }]),
    ]);

    return {
      ...encadrant,
      stagiairesActifs,
      totalEncadres,
      sujetsProposes: parseInt(sujetsProposesRows[0]?.count ?? '0', 10),
    };
  }
}
