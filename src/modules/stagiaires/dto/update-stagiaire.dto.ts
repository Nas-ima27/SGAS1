import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStagiaireDto } from './create-stagiaire.dto';

/**
 * Payload attendu par PATCH /stagiaires/:id (voir BACKEND_SPEC.md §3).
 *
 * PartialType rend tous les champs de CreateStagiaireDto optionnels
 * (mise à jour partielle) tout en conservant leurs règles de validation
 * quand ils sont fournis.
 *
 * `compteActif` est ajouté ici car le spec réutilise cette même route
 * pour l'activation/désactivation du compte ("même route que l'update
 * général") — ce n'est pas un champ de création, donc il n'a pas sa
 * place dans CreateStagiaireDto.
 */
export class UpdateStagiaireDto extends PartialType(CreateStagiaireDto) {
  @IsOptional()
  @IsBoolean()
  compteActif?: boolean;
}