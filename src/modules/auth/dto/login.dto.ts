import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Payload attendu par POST /auth/login (voir BACKEND_SPEC.md §1).
 */
export class LoginDto {
  @IsEmail({}, { message: 'Adresse email invalide.' })
    @IsNotEmpty({ message: "L'email est requis." })
    email!: string;

  @IsString()
    @IsNotEmpty({ message: 'Le mot de passe est requis.' })
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
    password!: string;
}