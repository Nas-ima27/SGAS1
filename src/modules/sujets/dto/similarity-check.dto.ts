import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload attendu par POST /sujets/similarity-check (voir BACKEND_SPEC.md §5).
 *
 * "À implémenter en priorité — le frontend l'appelle déjà mais n'a aucun
 * mode mock pour ce endpoint spécifique."
 *
 * Contrairement au payload de CreateSujetDto, description est ici
 * obligatoire (pas optionnelle) : le spec définit le payload comme
 * { titre: string, description: string } sans "?", et une comparaison
 * de similarité sur un titre seul, sans aucune description, serait de
 * toute façon peu fiable.
 */
export class SimilarityCheckDto {
  @IsString()
    @IsNotEmpty({ message: 'Le titre est requis.' })
    titre!: string;

  @IsString()
    @IsNotEmpty({ message: 'La description est requise.' })
    description!: string;
}