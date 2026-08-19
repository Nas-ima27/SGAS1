import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload attendu par PATCH /encadrants/:id/profile.
 * Distinct de UpdateEncadrantDto (Admin) — un Encadrant ne peut modifier
 * que son téléphone sur son propre profil (name/title/departement/email
 * restent administratifs, gérés par l'Admin).
 */
export class UpdateEncadrantProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;
}