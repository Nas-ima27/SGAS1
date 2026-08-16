import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RapportStatut } from '../enums/rapport-statut.enum';


/**
 * Voir BACKEND_SPEC.md §7 pour le modèle complet.
 *
 * Ressource en lecture seule côté frontend pour les 3 rôles — aucun
 * endpoint d'écriture n'est exposé publiquement (voir rapports.controller.ts,
 * seulement GET). Les entrées sont créées uniquement en interne, par
 * StagiairesService.evaluerRapport() quand un encadrant valide un rapport
 * (statut === Validé) — voir la logique dans stagiaires.service.ts.
 *
 * technologies utilise le même choix que Sujet.technologies (tableau
 * PostgreSQL natif plutôt qu'une table séparée, pour l'instant).
 */
@Entity('rapports')
export class Rapport {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    titre!: string;

  @Column({ type: 'text' })
    resume!: string;

  @Column()
    auteur!: string;

  @Column()
    ecole!: string;

  @Column()
    encadrant!: string;

  @Column()
    departement!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
    technologies!: string[];

  @Column({ type: 'int' })
    annee!: number;

  @Column({
    type: 'enum',
    enum: RapportStatut,
    default: RapportStatut.EN_ATTENTE_DE_VALIDATION,
  })
  statut: RapportStatut= RapportStatut.EN_ATTENTE_DE_VALIDATION;

  @Column({ type: 'timestamp', nullable: true })
    dateValidation!: Date | null;

  @Column({ type: 'varchar', nullable: true })
    fichierUrl!: string | null;

  @CreateDateColumn()
    createdAt!: Date;
}