import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload attendu par POST /encadrants (voir BACKEND_SPEC.md §4).
 *
 * compteActif=true est appliqué par défaut côté service — pas dans ce DTO,
 * pour rester cohérent avec le principe déjà appliqué sur CreateStagiaireDto
 * (les valeurs par défaut imposées par le serveur n'ont pas leur place
 * dans le payload de création).
 */
export class CreateEncadrantDto {
  @IsString()
    @IsNotEmpty({ message: 'Le nom est requis.' })
    name!: string;

  @IsString()
    @IsNotEmpty({ message: 'Le titre est requis.' })
    title!: string;

  @IsString()
    @IsNotEmpty({ message: 'Le département est requis.' })
    departement!: string;

  @IsEmail({}, { message: 'Adresse email invalide.' })
    email!: string;
}