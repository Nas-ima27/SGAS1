import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SujetStatut } from '../enums/sujet-statut.enum';

/**
 * Voir BACKEND_SPEC.md §5 pour le modèle complet et les endpoints associés.
 *
 * IMPORTANT :
 * - nombreCandidatures n'est PAS une colonne ici — calculé à la lecture
 *   par SujetsService (COUNT sur candidatures), même logique que les
 *   champs calculés d'Encadrant.
 * - sujetsSimilaires n'est pas non plus stocké — c'est un résultat
 *   d'analyse à la volée (POST /sujets/similarity-check), jamais persisté.
 * - encadrantId reste une simple colonne (pas de relation TypeORM), même
 *   raisonnement que sur Stagiaire.encadrantId : éviter une dépendance
 *   circulaire entre modules.
 * - technologies utilise le support natif des tableaux PostgreSQL
 *   (simple-array aurait stocké une chaîne séparée par virgules ; ici on
 *   utilise un vrai array Postgres, plus propre pour des requêtes futures
 *   type "WHERE 'React' = ANY(technologies)"). Si le besoin d'un GROUP BY
 *   par technologie individuelle devient pressant pour le dashboard (§9),
 *   on migrera vers une table sujet_technologies séparée à ce moment-là.
 */
@Entity('sujets')
export class Sujet {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    titre!: string;

  @Column({ type: 'text', nullable: true })
    description!: string | null;

  @Column()
    departement!: string;

  @Column({ type: 'int' })
    encadrantId!: number;

  @Column()
    encadrantName!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
    technologies!: string[];

  @Column({
        type: 'enum',
        enum: SujetStatut,
        default: SujetStatut.BROUILLON,
    })
    statut: SujetStatut = SujetStatut.BROUILLON;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}