import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload attendu par PATCH /stagiaires/:id/profile.
 * Volontairement distinct de UpdateStagiaireDto (réservé à l'Admin) —
 * ce DTO n'expose QUE les champs qu'un Stagiaire peut modifier sur son
 * propre dossier (informations personnelles, jamais administratives :
 * pas de departement, dateDebut, encadrantId, etc.).
 */
export class UpdateStagiaireProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  github?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}