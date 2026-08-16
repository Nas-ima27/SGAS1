import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SujetStatut } from './../enums/sujet-statut.enum';

/**
 * Payload attendu par POST /sujets (voir BACKEND_SPEC.md §5).
 *
 * encadrantId ET encadrantName sont tous les deux fournis par le client
 * ici (contrairement à Stagiaire où encadrantName est résolu côté
 * serveur lors de l'affectation) — le spec liste explicitement les deux
 * dans le payload attendu pour ce endpoint. Le service pourra tout de
 * même revalider encadrantName côté serveur si on veut plus de rigueur
 * plus tard.
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