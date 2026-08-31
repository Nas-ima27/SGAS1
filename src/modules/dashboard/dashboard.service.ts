import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { StagiaireStatut } from '../stagiaires/enums/stagiaire-statut.enum';
import { Sujet } from '../sujets/entities/sujet.entity';
import { SujetStatut } from '../sujets/enums/sujet-statut.enum';
import { Candidature } from '../candidatures/entities/candidature.entity';
import { CandidatureStatut } from '../candidatures/enums/candidature-statut.enum';
import { Rapport } from '../rapports/entities/rapport.entity';

/** Nombre de mois affichés dans l'évolution mensuelle (décision prise en conversation). */
const MONTHLY_EVOLUTION_MONTHS = 6;

export interface DashboardStats {
  stagiairesActifs: number;
  sujetsDisponibles: number;
  candidaturesEnAttente: number;
  rapportsArchives: number;
  evolutionMensuelle: Array<{ mois: string; count: number }>;
  repartitionParDepartement: Array<{ departement: string; count: number }>;
  technologiesLesPlusUtilisees: Array<{ technologie: string; count: number }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
    @InjectRepository(Sujet)
    private readonly sujetRepository: Repository<Sujet>,
    @InjectRepository(Candidature)
    private readonly candidatureRepository: Repository<Candidature>,
    @InjectRepository(Rapport)
    private readonly rapportRepository: Repository<Rapport>,
  ) {}

  /** GET /dashboard/stats — un seul appel composite (§9), pour éviter le sur-fetching. */
  async getStats(): Promise<DashboardStats> {
    await this.synchroniserStatutsAvecDates();
    const [
      stagiairesActifs,
      sujetsDisponibles,
      candidaturesEnAttente,
      rapportsArchives,
      evolutionMensuelle,
      repartitionParDepartement,
      technologiesLesPlusUtilisees,
    ] = await Promise.all([
      this.stagiaireRepository.count({ where: { statut: StagiaireStatut.EN_COURS } }),
      this.sujetRepository.count({ where: { statut: SujetStatut.PUBLIE } }),
      this.candidatureRepository.count({ where: { statut: CandidatureStatut.EN_ATTENTE } }),
      this.rapportRepository.count(),
      this.getEvolutionMensuelle(),
      this.getRepartitionParDepartement(),
      this.getTechnologiesLesPlusUtilisees(),
    ]);

    return {
      stagiairesActifs,
      sujetsDisponibles,
      candidaturesEnAttente,
      rapportsArchives,
      evolutionMensuelle,
      repartitionParDepartement,
      technologiesLesPlusUtilisees,
    };
  }

  private async synchroniserStatutsAvecDates(): Promise<void> {
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
   * "Évolution mensuelle des stages" (§9) — COUNT(stagiaires) GROUP BY MONTH(dateDebut)
   * sur les 6 derniers mois (décision prise en conversation). Génère les 6
   * mois même s'ils sont à 0, pour un graphique cohérent côté frontend
   * (Recharts, §2 frontend) plutôt que des mois manquants.
   */
  private async getEvolutionMensuelle(): Promise<Array<{ mois: string; count: number }>> {
    const now = new Date();
    const buckets: Array<{ mois: string; start: Date; end: Date }> = [];

    // Construit les bornes directement en UTC (Date.UTC) plutôt qu'avec
    // le constructeur Date local + toISOString() : ce dernier convertit
    // en UTC au moment de la conversion, ce qui décale la date d'un jour
    // (donc le mois calculé) dès que le serveur tourne dans un fuseau
    // différent d'UTC (ex: UTC+1 au Maroc) — bug repéré en test.
    for (let i = MONTHLY_EVOLUTION_MONTHS - 1; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      const mois = start.toISOString().slice(0, 7); // "AAAA-MM"
      buckets.push({ mois, start, end });
    }

    const counts = await Promise.all(
      buckets.map(({ start, end }) =>
        this.stagiaireRepository
          .createQueryBuilder('stagiaire')
          .where('stagiaire.dateDebut >= :start AND stagiaire.dateDebut < :end', {
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
          })
          .getCount(),
      ),
    );

    return buckets.map((bucket, index) => ({ mois: bucket.mois, count: counts[index] }));
  }

  /** "Répartition par département" (§9) — COUNT(stagiaires) GROUP BY departement. */
  private async getRepartitionParDepartement(): Promise<
    Array<{ departement: string; count: number }>
  > {
    const rows: Array<{ departement: string; count: string }> = await this.stagiaireRepository
      .createQueryBuilder('stagiaire')
      .select('stagiaire.departement', 'departement')
      .addSelect('COUNT(*)', 'count')
      .groupBy('stagiaire.departement')
      .getRawMany();

    return rows.map((row) => ({
      departement: row.departement,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * "Technologies les plus utilisées" (§9) — agrégation sur sujets.technologies.
   * unnest() déplie le tableau PostgreSQL en une ligne par technologie,
   * permettant un GROUP BY malgré le stockage en array plutôt qu'en table
   * séparée (voir sujet.entity.ts — dénormalisation en table
   * sujet_technologies suggérée par le spec si ce GROUP BY devenait un
   * point chaud, pas nécessaire à ce stade).
   */
  private async getTechnologiesLesPlusUtilisees(): Promise<
    Array<{ technologie: string; count: number }>
  > {
    const rows: Array<{ technologie: string; count: string }> = await this.sujetRepository.query(
      `SELECT unnest(technologies) AS technologie, COUNT(*) AS count
       FROM sujets
       GROUP BY technologie
       ORDER BY count DESC
       LIMIT 10`,
    );

    return rows.map((row) => ({
      technologie: row.technologie,
      count: parseInt(row.count, 10),
    }));
  }
}
