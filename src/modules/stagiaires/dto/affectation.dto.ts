import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * Payload attendu par PATCH /stagiaires/:id/affectation (voir BACKEND_SPEC.md §3).
 *
 * Le service doit résoudre encadrantName côté serveur à partir de cet id
 * et l'inclure dans la réponse (le spec l'exige explicitement).
 */
export class AffectationDto {
  @IsInt()
  @IsNotEmpty({ message: "L'id de l'encadrant est requis." })
  encadrantId: number | undefined;
}