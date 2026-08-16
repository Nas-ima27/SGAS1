/**
 * Statut du rapport d'un stagiaire (voir BACKEND_SPEC.md §3 — modèle Stagiaire,
 * champ `rapportStatut`).
 *
 * À ne pas confondre avec le statut d'un Rapport archivé en bibliothèque
 * (§7 du spec, valeurs différentes : "En attente de validation" |
 * "Corrections demandées" | "Validé") — ce sont deux workflows distincts :
 * celui-ci suit le rapport tant qu'il est côté Stagiaire, l'autre suit
 * l'entrée créée dans la bibliothèque une fois archivée.
 */
export enum StagiaireRapportStatut {
  NON_DEPOSE = 'Non déposé',
  EN_ATTENTE = 'En attente',
  CORRECTIONS_DEMANDEES = 'Corrections demandées',
  VALIDE = 'Validé',
}