import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Payload attendu par POST /stagiaires (voir BACKEND_SPEC.md §3).
 *
 * Les champs calculés/par défaut côté serveur (avancement=0,
 * statut="À venir", rapportStatut="Non déposé", compteActif=true)
 * ne figurent volontairement PAS dans ce DTO — le ValidationPipe global
 * (whitelist + forbidNonWhitelisted, voir main.ts) rejette la requête
 * si le frontend tentait de les envoyer, conformément à la règle §11.3
 * du spec ("les champs calculés ne doivent jamais être modifiables
 * directement via un PATCH").
 */
export class CreateStagiaireDto {
  @IsString()
    @IsNotEmpty({ message: 'Le nom est requis.' })
    name!: string;

  @IsEmail({}, { message: 'Adresse email invalide.' })
    email!: string;

  @IsString()
    @IsNotEmpty({ message: "L'école est requise." })
    ecole!: string;

  @IsString()
    @IsNotEmpty({ message: 'La filière est requise.' })
    filiere!: string;

  @IsString()
    @IsNotEmpty({ message: 'Le département est requis.' })
    departement!: string;

  @IsOptional()
  @IsInt()
  encadrantId?: number;

  @IsDateString({}, { message: 'dateDebut doit être une date valide (AAAA-MM-JJ).' })
    dateDebut!: string;

  @IsDateString({}, { message: 'dateFin doit être une date valide (AAAA-MM-JJ).' })
    dateFin!: string;
}