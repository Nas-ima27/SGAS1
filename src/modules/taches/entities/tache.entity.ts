import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TacheStatut } from '../enums/tache-statut.enum';

/**
 * Tâche assignée par un Encadrant à son Stagiaire (voir
 * TachesController — "envoyer des tâches à faire à son stagiaire").
 *
 * stagiaireId reste une simple colonne (pas de relation TypeORM), même
 * raisonnement que sur les autres entités (JournalEntry, etc.) — éviter
 * une dépendance circulaire entre modules. Pas de encadrantId stocké :
 * l'encadrant auteur se déduit de stagiaire.encadrantId au moment de la
 * lecture/écriture (vérifié dans TachesController), pas besoin de le
 * dupliquer ici.
 */
@Entity('taches')
export class Tache {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  stagiaireId!: number;

  @Column()
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: TacheStatut, default: TacheStatut.A_FAIRE })
  statut!: TacheStatut;

  @CreateDateColumn()
  createdAt!: Date;
}
