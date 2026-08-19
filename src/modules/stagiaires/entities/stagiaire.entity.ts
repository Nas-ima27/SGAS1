import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StagiaireStatut } from '../enums/stagiaire-statut.enum';
import { StagiaireRapportStatut } from '../enums/stagiaire-rapport-statut.enum';
import { TypeStage } from '../enums/type-stage.enum';

@Entity('stagiaires')
export class Stagiaire {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @Column()
    email!: string;

  @Column({ type: 'varchar', nullable: true })
    telephone!: string | null;

  @Column({ type: 'varchar', nullable: true })
    linkedin!: string | null;

  @Column({ type: 'varchar', nullable: true })
    github!: string | null;

  @Column({ type: 'text', nullable: true })
    bio!: string | null;

  @Column()
    ecole!: string;

  @Column()
    filiere!: string;

  /** PFA (Projet de Fin d'Année) ou PFE (Projet de Fin d'Études). */
  @Column({ type: 'enum', enum: TypeStage })
    typeStage!: TypeStage;

  @Column()
    departement!: string;

  @Column({ type: 'int', nullable: true })
    encadrantId!: number | null;

  @Column({ type: 'varchar', nullable: true })
    encadrantName!: string | null;

  @Column({ type: 'date' })
    dateDebut!: string;

  @Column({ type: 'date' })
    dateFin!: string;

  /** Progression du stage, de 0 à 100. */
  @Column({ type: 'int', default: 0 })
    avancement!: number;

  @Column({
        type: 'enum',
        enum: StagiaireStatut,
        default: StagiaireStatut.A_VENIR,
    })
    statut: StagiaireStatut = StagiaireStatut.A_VENIR;

  @Column({
        type: 'enum',
        enum: StagiaireRapportStatut,
        default: StagiaireRapportStatut.NON_DEPOSE,
    })
    rapportStatut: StagiaireRapportStatut = StagiaireRapportStatut.NON_DEPOSE;

  @Column({ type: 'varchar', nullable: true })
    rapportFichierNom!: string | null;
  @Column({ type: 'varchar', nullable: true })
    rapportFichierUrl: string | null | undefined;
  @Column({ type: 'timestamp', nullable: true })
    rapportDateDepot!: Date | null;

  /** Dernier commentaire de correction de l'encadrant — effacé à chaque redépôt (voir §3). */
  @Column({ type: 'text', nullable: true })
    rapportCommentaire!: string | null;

  @Column({ type: 'int', nullable: true })
    sujetId!: number | null;

  @Column({ default: true })
    compteActif!: boolean;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}