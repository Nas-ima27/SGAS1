import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateEncadrantDto } from './create-encadrant.dto';

/**
 * Payload attendu par PATCH /encadrants/:id (voir BACKEND_SPEC.md §4).
 *
 * `compteActif` géré ici pour la même raison que sur UpdateStagiaireDto :
 * le spec réutilise cette route pour le toggle Actif/Inactif ("même route
 * que l'update général").
 * `telephone` ajouté ici : absent de CreateEncadrantDto (pas dans le
 * payload de création selon §4) mais modifiable via update.
 */
export class UpdateEncadrantDto extends PartialType(CreateEncadrantDto) {
  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsBoolean()
  compteActif?: boolean;
}