import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encadrant } from './entities/encadrant.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { StagiaireStatut } from '../stagiaires/enums/stagiaire-statut.enum';
import { CreateEncadrantDto } from './dto/create-encadrant.dto';
import { UpdateEncadrantDto } from './dto/update-encadrant.dto';

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
  ) {}

  async findAll(): Promise<EncadrantWithStats[]> {
    const encadrants = await this.encadrantRepository.find();
    return Promise.all(encadrants.map((e) => this.withStats(e)));
  }

  async findOne(id: number): Promise<EncadrantWithStats> {
    const encadrant = await this.encadrantRepository.findOne({ where: { id } });
    if (!encadrant) {
      throw new NotFoundException(`Encadrant ${id} introuvable.`);
    }
    return this.withStats(encadrant);
  }

  async create(dto: CreateEncadrantDto): Promise<EncadrantWithStats> {
    const encadrant = this.encadrantRepository.create({
      ...dto,
      compteActif: true,
    });
    const saved = await this.encadrantRepository.save(encadrant);
    return this.withStats(saved);
  }

  async update(id: number, dto: UpdateEncadrantDto): Promise<EncadrantWithStats> {
    const encadrant = await this.encadrantRepository.findOne({ where: { id } });
    if (!encadrant) {
      throw new NotFoundException(`Encadrant ${id} introuvable.`);
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