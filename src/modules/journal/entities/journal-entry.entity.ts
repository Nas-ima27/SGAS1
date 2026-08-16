import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JournalEntryType } from '../enums/journal-entry-type.enum';


/**
 * Voir BACKEND_SPEC.md §8. stagiaireId reste une simple colonne (pas de
 * relation TypeORM), même raisonnement que sur les autres entités —
 * éviter une dépendance circulaire entre modules.
 * date = @CreateDateColumn, cohérent avec "calculée au moment de la
 * création" indiqué dans le spec.
 */
@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  stagiaireId!: number;

  @Column({ type: 'enum', enum: JournalEntryType })
  type!: JournalEntryType;

  @CreateDateColumn()
  date!: Date;

  @Column({ type: 'text' })
  contenu!: string;
}