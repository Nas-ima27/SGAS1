import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Payload attendu par POST /candidatures (voir BACKEND_SPEC.md §6).
 *
 * stagiaireId ajouté par rapport au spec écrit (voir candidature.entity.ts
 * pour le détail de cette décision) — le frontend le renseigne avec
 * useAuth().user.id, le stagiaire étant déjà connecté au moment de postuler.
 */
export class CreateCandidatureDto {
  @IsString()
    @IsNotEmpty({ message: 'Le nom du candidat est requis.' })
    candidatName!: string;

  @IsEmail({}, { message: 'Adresse email invalide.' })
    candidatEmail!: string;

  @IsInt()
    stagiaireId!: number;

  @IsInt()
    sujetId!: number;

  @IsString()
    @IsNotEmpty({ message: 'Le titre du sujet est requis.' })
    sujetTitre!: string;

  @IsString()
    @IsNotEmpty({ message: "L'école est requise." })
    ecole!: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;
}