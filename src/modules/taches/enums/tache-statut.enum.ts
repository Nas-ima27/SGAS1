/**
 * Statut d'une tâche assignée par un encadrant à son stagiaire (voir
 * TachesController). Deux états suffisent pour le besoin actuel — pas de
 * "En cours" séparé, à faire évoluer si besoin plus fin plus tard.
 */
export enum TacheStatut {
  A_FAIRE = 'À faire',
  FAITE = 'Faite',
}
