import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Rapport } from './entities/rapport.entity';
import { RapportStatut } from './enums/rapport-statut.enum';

export interface FindRapportsQuery {
  departement?: string;
  annee?: number;
  search?: string;
}

/**
 * Données nécessaires pour créer automatiquement une entrée bibliothèque
 * à partir d'un Stagiaire dont le rapport vient d'être validé — fournies
 * par StagiairesService.evaluerRapport() (voir stagiaires.service.ts),
 * qui a accès à toutes ces infos (Stagiaire + Sujet lié).
 */
export interface CreateRapportFromStagiaireInput {
  titre: string;
  resume: string;
  auteur: string;
  ecole: string;
  encadrant: string;
  departement: string;
  technologies: string[];
  fichierUrl: string | null;
}

@Injectable()
export class RapportsService {
  constructor(
    @InjectRepository(Rapport)
    private readonly rapportRepository: Repository<Rapport>,
  ) {}

  /**
   * GET /rapports
   * §7 : filtres optionnels departement, annee, search.
   * search s'applique sur le titre (ILIKE, insensible à la casse).
   */
  findAll(query: FindRapportsQuery): Promise<Rapport[]> {
    const where: FindOptionsWhere<Rapport> = {};

    if (query.departement) {
      where.departement = query.departement;
    }
    if (query.annee) {
      where.annee = query.annee;
    }
    if (query.search) {
      where.titre = ILike(`%${query.search}%`);
    }

    return this.rapportRepository.find({ where });
  }

  async findOne(id: number): Promise<Rapport> {
    const rapport = await this.rapportRepository.findOne({ where: { id } });
    if (!rapport) {
      throw new NotFoundException(`Rapport ${id} introuvable.`);
    }
    return rapport;
  }

  /**
   * Création interne uniquement (pas d'endpoint POST public — §7 :
   * "Cette ressource est en lecture seule pour les 3 rôles").
   * Appelée par StagiairesService.evaluerRapport() quand statut === Validé.
   * annee = année courante ; statut = Validé directement, puisque le rapport
   * vient justement d'être validé par l'encadrant côté Stagiaire.
   */
  async createFromStagiaire(input: CreateRapportFromStagiaireInput): Promise<Rapport> {
    const rapport = this.rapportRepository.create({
      ...input,
      annee: new Date().getFullYear(),
      statut: RapportStatut.VALIDE,
      dateValidation: new Date(),
    });
    return this.rapportRepository.save(rapport);
  }
}