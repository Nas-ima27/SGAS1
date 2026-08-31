import { IsEnum } from 'class-validator';
import { UtilisateurStatus } from '../enums/utilisateur-statut.enum';

export class UpdateUtilisateurStatusDto {
  @IsEnum(UtilisateurStatus)
  status!: UtilisateurStatus;
}
