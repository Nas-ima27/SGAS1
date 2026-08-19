import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Payload attendu par PATCH /auth/change-password.
 * Utilisable par tout compte connecté (Admin, Encadrant, Stagiaire) —
 * voir AuthService.changePassword. Nécessaire depuis que le premier mot
 * de passe est un mot de passe par défaut prévisible (voir
 * default-password.util.ts) : chaque compte doit pouvoir le remplacer.
 */
export class ChangePasswordDto {
  @IsString()
    @IsNotEmpty({ message: 'Le mot de passe actuel est requis.' })
    currentPassword!: string;

  @IsString()
    @IsNotEmpty({ message: 'Le nouveau mot de passe est requis.' })
    @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
    newPassword!: string;
}
