import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidatureStatut } from './enums/candidature-statut.enum';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';
import { Sujet } from '../sujets/entities/sujet.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { Candidature } from './entities/candidature.entity';

@Injectable()
export class CandidaturesService {
  constructor(
    @InjectRepository(Candidature)
    private readonly candidatureRepository: Repository<Candidature>,
    // Repositories importés directement (même pattern que EncadrantsService
    // avec Stagiaire) plutôt que d'injecter SujetsService/StagiairesService
    // en entier — on n'a besoin ici que de lectures/écritures ciblées.
    @InjectRepository(Sujet)
    private readonly sujetRepository: Repository<Sujet>,
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
  ) {}

  findAll(): Promise<Candidature[]> {
    return this.candidatureRepository.find();
  }

  async findOne(id: number): Promise<Candidature> {
    const candidature = await this.candidatureRepository.findOne({ where: { id } });
    if (!candidature) {
      throw new NotFoundException(`Candidature ${id} introuvable.`);
    }
    return candidature;
  }

  /**
   * POST /candidatures
   * §6 : "Vérifier qu'aucune candidature existante n'a déjà (sujetId,
   * candidatEmail) identique — le frontend fait cette vérification côté
   * client mais le backend doit la garantir aussi."
   */
  async create(dto: CreateCandidatureDto): Promise<Candidature> {
    const existing = await this.candidatureRepository.findOne({
      where: { sujetId: dto.sujetId, candidatEmail: dto.candidatEmail },
    });

    if (existing) {
      throw new ConflictException(
        'Une candidature existe déjà pour ce sujet avec cet email.',
      );
    }

    const candidature = this.candidatureRepository.create({
      ...dto,
      statut: CandidatureStatut.EN_ATTENTE,
    });

    return this.candidatureRepository.save(candidature);
  }

  /**
   * PATCH /candidatures/:id
   *
   * Décision prise en conversation (remplace la "question ouverte" du §6
   * du spec) : quand statut passe à "Acceptée", le Stagiaire correspondant
   * (via candidature.stagiaireId) est automatiquement mis à jour avec le
   * sujetId et l'encadrant du sujet accepté — le dossier Stagiaire existe
   * déjà (créé par l'Admin en amont), on ne fait que le compléter.
   *
   * "Refusée" ou "En attente" : aucun effet de bord sur le Stagiaire.
   */
  async update(id: number, dto: UpdateCandidatureDto): Promise<Candidature> {
    const candidature = await this.findOne(id);
    candidature.statut = dto.statut;
    const saved = await this.candidatureRepository.save(candidature);

    if (dto.statut === CandidatureStatut.ACCEPTEE) {
      await this.appliquerAffectationStagiaire(candidature);
    }

    return saved;
  }

  private async appliquerAffectationStagiaire(candidature: Candidature): Promise<void> {
    const sujet = await this.sujetRepository.findOne({
      where: { id: candidature.sujetId },
    });
    if (!sujet) {
      // Ne bloque pas l'acceptation elle-même si le sujet a été supprimé
      // entre-temps — situation limite, mais la candidature reste valide
      // même si l'affectation automatique ne peut pas s'appliquer.
      return;
    }

    const stagiaire = await this.stagiaireRepository.findOne({
      where: { id: candidature.stagiaireId },
    });
    if (!stagiaire) {
      return;
    }

    stagiaire.sujetId = sujet.id;
    stagiaire.encadrantId = sujet.encadrantId;
    stagiaire.encadrantName = sujet.encadrantName;

    await this.stagiaireRepository.save(stagiaire);
  }
}