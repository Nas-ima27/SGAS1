import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Voir BACKEND_SPEC.md §4 pour le modèle complet et les endpoints associés.
 *
 * IMPORTANT : stagiairesActifs, totalEncadres et sujetsProposes ne sont
 * PAS des colonnes ici — le spec les décrit explicitement comme des
 * valeurs calculées, jamais stockées. Elles seront ajoutées à la réponse
 * par EncadrantsService à la lecture (COUNT sur stagiaires/sujets), pas
 * par TypeORM ni par une colonne en base.
 */
@Entity('encadrants')
export class Encadrant {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @Column()
    title!: string;

  @Column()
    departement!: string;

  @Column()
    email!: string;

  @Column({ type: 'varchar', nullable: true })
    telephone!: string | null;

  @Column({ default: true })
    compteActif!: boolean;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}