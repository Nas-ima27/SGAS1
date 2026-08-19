import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload attendu par PATCH /stagiaires/:id/journal/:entryId/commentaire.
 */
export class AddJournalCommentDto {
  @IsString()
    @IsNotEmpty({ message: 'Le commentaire est requis.' })
    commentaire!: string;
}
