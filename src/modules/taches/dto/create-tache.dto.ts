import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Payload attendu par POST /stagiaires/:id/taches.
 * stagiaireId vient de l'URL (:id), pas du body.
 */
export class CreateTacheDto {
  @IsString()
    @IsNotEmpty({ message: 'Le titre est requis.' })
    titre!: string;

  @IsOptional()
    @IsString()
    description?: string;
}
