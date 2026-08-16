import { IsIn, IsOptional, IsString } from 'class-validator';
import { StagiaireRapportStatut } from '../enums/stagiaire-rapport-statut.enum';

/**
 * Payload attendu par PATCH /stagiaires/:id/rapport/evaluation
 * (voir BACKEND_SPEC.md §3).
 *
 * Appelé par un Encadrant uniquement — le controller doit vérifier
 * que req.user.role === Encadrant ET que encadrantId du stagiaire ciblé
 * correspond à req.user.id (vérification à faire dans le service, pas
 * exprimable via un simple DTO).
 *
 * Seules 2 des 4 valeurs de StagiaireRapportStatut sont autorisées ici :
 * un encadrant évalue un rapport déjà déposé, il ne peut pas le remettre
 * à "Non déposé" ou "En attente" (ces statuts sont gérés automatiquement
 * par le service au moment du dépôt, voir POST /stagiaires/:id/rapport).
 */
export class EvaluationRapportDto {
  @IsIn([StagiaireRapportStatut.VALIDE, StagiaireRapportStatut.CORRECTIONS_DEMANDEES], {
        message: 'statut doit être "Validé" ou "Corrections demandées".',
    })
    statut: StagiaireRapportStatut.VALIDE | StagiaireRapportStatut.CORRECTIONS_DEMANDEES = StagiaireRapportStatut.CORRECTIONS_DEMANDEES;

  @IsOptional()
  @IsString()
  commentaire?: string;
}