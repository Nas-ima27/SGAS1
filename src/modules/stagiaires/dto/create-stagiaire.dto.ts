import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TypeStage } from '../enums/type-stage.enum';

/**
 * Payload attendu par POST /stagiaires (voir BACKEND_SPEC.md §3).
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

  @IsEnum(TypeStage, { message: 'typeStage doit être "PFA" ou "PFE".' })
    typeStage!: TypeStage;

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