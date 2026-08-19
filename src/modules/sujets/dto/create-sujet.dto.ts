import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SujetStatut } from './../enums/sujet-statut.enum';
import { TypeCandidatSujet } from './../enums/type-candidat-sujet.enum';

/**
 * Payload attendu par POST /sujets (voir BACKEND_SPEC.md §5).
 */
export class CreateSujetDto {
  @IsString()
    @IsNotEmpty({ message: 'Le titre est requis.' })
    titre!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
    @IsNotEmpty({ message: 'Le département est requis.' })
    departement!: string;

  @IsOptional()
  @IsEnum(TypeCandidatSujet, { message: 'typeCandidat doit être "PFA", "PFE" ou "PFA et PFE".' })
  typeCandidat?: TypeCandidatSujet;

  @IsInt()
    encadrantId!: number;

  @IsString()
    @IsNotEmpty({ message: "Le nom de l'encadrant est requis." })
    encadrantName!: string;

  @IsArray()
    @IsString({ each: true })
    technologies!: string[];

  @IsOptional()
  @IsEnum(SujetStatut, { message: 'statut doit être Brouillon, Publié ou Clos.' })
  statut?: SujetStatut;
}