import { IsEnum } from 'class-validator';
import { CandidatureStatut } from '../enums/candidature-statut.enum';

/**
 * Payload attendu par PATCH /candidatures/:id (voir BACKEND_SPEC.md §6).
 * Sert exclusivement à Accepter/Refuser — le seul champ modifiable après
 * création est le statut, les autres champs (candidatName, sujetId, etc.)
 * ne sont pas censés changer une fois la candidature soumise.
 */
export class UpdateCandidatureDto {
  @IsEnum(CandidatureStatut, {
    message: 'statut doit être "En attente", "Acceptée" ou "Refusée".',
  })
  statut!: CandidatureStatut;
}