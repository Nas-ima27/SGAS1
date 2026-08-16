import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Payload attendu par POST /users (voir BACKEND_SPEC.md §2, adapté selon
 * décisions prises en conversation) : crée à la fois l'entrée Utilisateur
 * (annuaire) et un compte User (auth, role=Admin) — voir users.service.ts.
 *
 * isSuperAdmin détermine si ce nouveau compte pourra lui-même créer
 * d'autres comptes internes (true = Admin complet) ou seulement gérer
 * Encadrant/Stagiaire (false = "Gestionnaire", valeur par défaut).
 */
export class CreateUtilisateurDto {
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  lastName!: string;

  @IsEmail({}, { message: 'Adresse email invalide.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le service est requis.' })
  service!: string;

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}