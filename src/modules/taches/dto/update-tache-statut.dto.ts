import { IsEnum } from 'class-validator';
import { TacheStatut } from '../enums/tache-statut.enum';

/**
 * Payload attendu par PATCH /stagiaires/:id/taches/:tacheId.
 */
export class UpdateTacheStatutDto {
  @IsEnum(TacheStatut, { message: 'statut doit être "À faire" ou "Faite".' })
  statut!: TacheStatut;
}
