/**
 * Statut d'un rapport archivé en bibliothèque (voir BACKEND_SPEC.md §7 —
 * modèle Rapport).
 *
 * À ne pas confondre avec StagiaireRapportStatut (module stagiaires) —
 * voir le commentaire de ce dernier pour la distinction entre les deux
 * workflows.
 */
export enum RapportStatut {
  EN_ATTENTE_DE_VALIDATION = 'En attente de validation',
  CORRECTIONS_DEMANDEES = 'Corrections demandées',
  VALIDE = 'Validé',
}