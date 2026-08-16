import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisateurStatus } from '../enums/utilisateur-statut.enum';


/**
 * Comptes internes Admin/RH (voir BACKEND_SPEC.md §2), gérés depuis
 * l'espace Admin uniquement (features/users/, §6.1 frontend).
 *
 * Nommée "Utilisateur" (pas "User") pour éviter toute confusion avec
 * l'entité User du module auth (modules/auth/entities/user.entity.ts),
 * qui gère les véritables identifiants de connexion à l'application —
 * ce sont deux concepts totalement distincts, sans lien entre eux :
 * Utilisateur est un simple annuaire de contacts RH internes, PAS un
 * compte de connexion, et n'a aucun rapport avec les rôles applicatifs
 * (Admin/Encadrant/Stagiaire, voir common/enums/role.enum.ts).
 *
 * Écart volontaire par rapport au spec §2 : le champ `role` a été retiré
 * après discussion — jugé sans utilité fonctionnelle claire et source de
 * confusion avec le système de rôles applicatifs. Entité volontairement
 * minimale : un simple annuaire (nom, email, service, statut).
 */
@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  service!: string;

  @Column({
    type: 'enum',
    enum: UtilisateurStatus,
    default: UtilisateurStatus.ACTIF,
  })
  status!: UtilisateurStatus;

  @CreateDateColumn()
  createdAt!: Date;
}