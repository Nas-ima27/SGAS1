import { PartialType } from '@nestjs/mapped-types';
import { CreateSujetDto } from './create-sujet.dto';

/**
 * Payload attendu par PATCH /sujets/:id (voir BACKEND_SPEC.md §5).
 *
 * Réutilisé aussi pour Publier/Dépublier un sujet (PATCH avec juste
 * { statut } — "même route que l'update général", comme pour
 * Stagiaire.compteActif et Encadrant.compteActif).
 * Rien à ajouter par rapport à CreateSujetDto ici (contrairement à
 * Stagiaire/Encadrant) : tous les champs, y compris statut, sont déjà
 * dans CreateSujetDto — PartialType suffit.
 */
export class UpdateSujetDto extends PartialType(CreateSujetDto) {}