import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Stagiaire } from './entities/stagiaire.entity';
import { StagiaireStatut } from './enums/stagiaire-statut.enum';
import { StagiaireRapportStatut } from './enums/stagiaire-rapport-statut.enum';
import { CreateStagiaireDto } from './dto/create-stagiaire.dto';
import { UpdateStagiaireDto } from './dto/update-stagiaire.dto';
import { AffectationDto } from './dto/affectation.dto';
import { EvaluationRapportDto } from './dto/evaluation-rapport.dto';
import { RequestUser } from '../auth/jwt.strategy';
import { User } from '../auth/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { Sujet } from '../sujets/entities/sujet.entity';
import { RapportsService } from '../rapports/rapports.service';
import { UploadsService } from '../uploads/uploads.service';
import { EmailUniquenessService } from '../../common/email-uniqueness/email-uniqueness.service';
import { UpdateStagiaireProfileDto } from './dto/update-stagiaire-profile.dto';
import { generateDefaultPassword, splitPrenomNom } from '../../common/utils/default-password.util';
function validateStageDates(dateDebut: string, dateFin: string): void {
  const today = new Date().toISOString().slice(0, 10);

  if (dateDebut < today) {
    throw new BadRequestException('La date de debut ne peut pas etre dans le passe.');
  }
  if (dateFin <= dateDebut) {
    throw new BadRequestException(
      'La date de fin doit etre strictement posterieure a la date de debut.',
    );
  }
}

@Injectable()
export class StagiairesService {
  constructor(
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
    @InjectRepository(Sujet)
    private readonly sujetRepository: Repository<Sujet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rapportsService: RapportsService,
    private readonly uploadsService: UploadsService,
    private readonly emailUniquenessService: EmailUniquenessService,
  ) {}

  async findAll(): Promise<Stagiaire[]> {
    await this.synchroniserStatutsAvecDates();
    return this.stagiaireRepository.find();
  }

  async findOne(id: number): Promise<Stagiaire> {
    await this.synchroniserStatutsAvecDates();
    const stagiaire = await this.stagiaireRepository.findOne({ where: { id } });
    if (!stagiaire) {
      throw new NotFoundException(`Stagiaire ${id} introuvable.`);
    }
    return stagiaire;
  }

  async synchroniserStatutsAvecDates(): Promise<void> {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const stagiaires = await this.stagiaireRepository.find();
    const aMettreAJour = stagiaires.filter((stagiaire) => {
      const statutAttendu = aujourdHui < stagiaire.dateDebut
        ? StagiaireStatut.A_VENIR
        : aujourdHui >= stagiaire.dateFin
          ? StagiaireStatut.TERMINE
          : StagiaireStatut.EN_COURS;
      if (stagiaire.statut === statutAttendu) return false;
      stagiaire.statut = statutAttendu;
      return true;
    });
    if (aMettreAJour.length > 0) await this.stagiaireRepository.save(aMettreAJour);
  }
  /**
 * PATCH /stagiaires/:id/profile
 * Le Stagiaire modifie ses propres informations personnelles
 * (telephone, linkedin, github, bio) — jamais les champs administratifs.
 * La vérification que req.user.id === id se fait dans le controller.
 */
async updateProfile(id: number, dto: UpdateStagiaireProfileDto): Promise<Stagiaire> {
  const stagiaire = await this.findOne(id);
  Object.assign(stagiaire, dto);
  return this.stagiaireRepository.save(stagiaire);
}

  /**
   * CORRECTIF : crée aussi le compte de connexion (User, role=Stagiaire)
   * lié à cette fiche — auparavant absent : seul le seed de démo créait un
   * compte pour un Stagiaire (sara.elamrani@emi.ac.ma), un Stagiaire ajouté
   * via l'UI n'avait donc aucun moyen de se connecter.
   *
   * Mot de passe par défaut PRÉVISIBLE (2 lettres nom + 3 lettres prénom +
   * date de début de stage, JJMMAAAA — voir generateDefaultPassword),
   * renvoyé une seule fois dans la réponse pour que l'admin le communique
   * (pas d'email automatique, voir UsersService.create pour le contexte).
   */
  async create(dto: CreateStagiaireDto): Promise<Stagiaire & { tempPassword: string }> {
    validateStageDates(dto.dateDebut, dto.dateFin);
    const email = this.emailUniquenessService.normalize(dto.email);
    await this.emailUniquenessService.assertAvailable(email);
    // Valeurs par défaut imposées par le serveur (§3 du spec) — jamais
    // laissées au choix du client, même si le DTO ne les expose pas déjà.
    const stagiaire = this.stagiaireRepository.create({
      ...dto,
      email,
      avancement: 0,
      statut: StagiaireStatut.A_VENIR,
      rapportStatut: StagiaireRapportStatut.NON_DEPOSE,
      compteActif: true,
    });
    const saved = await this.stagiaireRepository.save(stagiaire);

    const { prenom, nom } = splitPrenomNom(saved.name);
    const tempPassword = generateDefaultPassword({ nom, prenom, date: saved.dateDebut });
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepository.create({
      name: saved.name,
      email,
      passwordHash,
      role: Role.STAGIAIRE,
      encadrantId: null,
      stagiaireId: saved.id,
      compteActif: true,
      // Mot de passe par défaut prévisible (voir tempPassword ci-dessus)
      // — bloque l'accès à l'app tant qu'il n'est pas changé, voir
      // AuthService.changePassword et ProtectedRoute côté frontend.
      mustChangePassword: true,
    });
    await this.userRepository.save(user);

    return { ...saved, tempPassword };
  }

  async update(id: number, dto: UpdateStagiaireDto): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);
    if (dto.dateDebut || dto.dateFin) {
      validateStageDates(dto.dateDebut ?? stagiaire.dateDebut, dto.dateFin ?? stagiaire.dateFin);
    }
    if (dto.email) {
      dto.email = this.emailUniquenessService.normalize(dto.email);
      await this.emailUniquenessService.assertAvailable(dto.email, {
        entity: 'stagiaire',
        id,
      });
    }
    Object.assign(stagiaire, dto);
    const saved = await this.stagiaireRepository.save(stagiaire);
    if (dto.compteActif !== undefined) {
      await this.userRepository.update(
        { stagiaireId: id, role: Role.STAGIAIRE },
        { compteActif: dto.compteActif },
      );
    }
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.stagiaireRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stagiaire ${id} introuvable.`);
    }
  }

  /**
   * PATCH /stagiaires/:id/affectation
   *
   * Résout encadrantName via une requête directe sur la table "encadrants"
   * plutôt qu'en important l'entité Encadrant (le module encadrants n'existe
   * pas encore à ce stade du projet). Cette requête ne fonctionnera qu'une
   * fois la table "encadrants" créée par sa propre migration — à remplacer
   * par un EncadrantsService injecté une fois ce module construit, pour un
   * code plus robuste (typé, sans SQL brut).
   */
  async affecterEncadrant(id: number, dto: AffectationDto): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);

    const rows: Array<{ name: string }> = await this.stagiaireRepository.manager.query(
      'SELECT name FROM encadrants WHERE id = $1',
      [dto.encadrantId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Encadrant ${dto.encadrantId} introuvable.`);
    }

    stagiaire.encadrantId = dto.encadrantId ?? null;
    stagiaire.encadrantName = rows[0].name;

    return this.stagiaireRepository.save(stagiaire);
  }

  async updateAvancement(
    id: number,
    avancement: number,
    requestUser: RequestUser,
  ): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);
    if (requestUser.role !== Role.ENCADRANT || stagiaire.encadrantId !== requestUser.id) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à évaluer l'avancement de ce stagiaire.",
      );
    }
    stagiaire.avancement = avancement;
    return this.stagiaireRepository.save(stagiaire);
  }

  /**
   * POST /stagiaires/:id/rapport
   *
   * Upload réel vers S3 (bucket MinIO local pour l'instant, voir
   * discussion — bucket public, pas d'URL signée) via UploadsService.
   * Applique ensuite la règle métier du §3 : passage à "En attente",
   * horodatage du dépôt, effacement du commentaire de correction précédent.
   */
  // Use a broad type for uploaded file to avoid issues with differing multer/express types
  async deposerRapport(id: number, file: any): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);
    const aujourdHui = new Date().toISOString().slice(0, 10);

    if (aujourdHui < stagiaire.dateDebut) {
      throw new BadRequestException(
        'Le rapport ne peut être déposé qu’à partir de la date de début du stage.',
      );
    }

    if (!stagiaire.sujetId) {
      throw new BadRequestException(
        'Le rapport ne peut être déposé qu’après l’acceptation de votre candidature à un sujet.',
      );
    }

    const uploaded = await this.uploadsService.uploadFile(file, 'rapports');

    stagiaire.rapportStatut = StagiaireRapportStatut.EN_ATTENTE;
    stagiaire.rapportFichierNom = uploaded.fileName;
    stagiaire.rapportFichierUrl = uploaded.fileUrl;
    stagiaire.rapportDateDepot = new Date();
    stagiaire.rapportCommentaire = null;

    return this.stagiaireRepository.save(stagiaire);
  }

  /**
   * PATCH /stagiaires/:id/rapport/evaluation
   *
   * Règle §1 du spec : vérifie que l'encadrant connecté est bien celui
   * assigné à ce stagiaire avant d'autoriser l'évaluation. La vérification
   * du rôle (Encadrant) elle-même reste au niveau du controller via
   * @Roles(Role.ENCADRANT) — ici on ne vérifie que la propriété fine
   * (CE encadrant sur CE stagiaire précis), ce qu'un guard générique
   * ne peut pas faire.
   */
  async evaluerRapport(
    id: number,
    dto: EvaluationRapportDto,
    requestUser: RequestUser,
  ): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);
    const etaitDejaValide = stagiaire.rapportStatut === StagiaireRapportStatut.VALIDE;

    if (requestUser.role !== Role.ENCADRANT || stagiaire.encadrantId !== requestUser.id) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à évaluer le rapport de ce stagiaire.",
      );
    }

    stagiaire.rapportStatut = dto.statut;
    stagiaire.rapportCommentaire = dto.commentaire ?? null;
    if (dto.statut === StagiaireRapportStatut.VALIDE) {
      stagiaire.avancement = 100;
    }

    const saved = await this.stagiaireRepository.save(stagiaire);

    // §7 : quand un rapport est validé, création automatique d'une entrée
    // dans la bibliothèque. titre/resume proviennent du Sujet assigné au
    // stagiaire (décision prise en conversation — aucun champ dédié
    // titre/resume n'existe sur Stagiaire).
    if (dto.statut === StagiaireRapportStatut.VALIDE && !etaitDejaValide) {
      const sujet = stagiaire.sujetId
        ? await this.sujetRepository.findOne({ where: { id: stagiaire.sujetId } })
        : null;

      if (sujet) {
        await this.rapportsService.createFromStagiaire({
          titre: sujet.titre,
          resume: sujet.description ?? '',
          auteur: stagiaire.name,
          ecole: stagiaire.ecole,
          encadrant: stagiaire.encadrantName ?? '',
          departement: stagiaire.departement,
          technologies: sujet.technologies,
          fichierUrl: stagiaire.rapportFichierUrl ?? null,
        });
      }
      if (!sujet) {
        const titre = stagiaire.rapportFichierNom?.replace(/\.[^/.]+$/, '') ?? `Rapport de stage — ${stagiaire.name}`;
        await this.rapportsService.createFromStagiaire({
          titre,
          resume: `Rapport de stage de ${stagiaire.name}, validé par ${stagiaire.encadrantName ?? 'son encadrant'}.`,
          auteur: stagiaire.name,
          ecole: stagiaire.ecole,
          encadrant: stagiaire.encadrantName ?? '',
          departement: stagiaire.departement,
          technologies: [],
          fichierUrl: stagiaire.rapportFichierUrl ?? null,
        });
      }
      // Si le sujet est introuvable, aucune entrée bibliothèque n'est créée
      // — même logique de tolérance que candidatures.service.ts (ne bloque
      // pas l'évaluation elle-même).
    }

    return saved;
  }
}
