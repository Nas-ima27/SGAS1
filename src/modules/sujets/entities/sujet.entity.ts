import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SujetStatut } from '../enums/sujet-statut.enum';
import { TypeCandidatSujet } from '../enums/type-candidat-sujet.enum';

/**
 * Voir BACKEND_SPEC.md §5 pour le modèle complet et les endpoints associés.
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

  /** Type de candidat visé : PFA, PFE, ou les deux. */
  @Column({
        type: 'enum',
        enum: TypeCandidatSujet,
        default: TypeCandidatSujet.PFA_ET_PFE,
    })
    typeCandidat: TypeCandidatSujet = TypeCandidatSujet.PFA_ET_PFE;

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