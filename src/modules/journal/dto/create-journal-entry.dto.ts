import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { JournalEntryType } from '../enums/journal-entry-type.enum';

/**
 * Payload attendu par POST /stagiaires/:id/journal (voir BACKEND_SPEC.md §8).
 * stagiaireId vient de l'URL (:id), pas du body — cohérent avec le spec.
 */
export class CreateJournalEntryDto {
  @IsEnum(JournalEntryType, {
    message: 'type doit être "Journalier" ou "Hebdomadaire".',
  })
  type!: JournalEntryType;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est requis.' })
  contenu!: string;
}