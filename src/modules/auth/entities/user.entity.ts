import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';

/**
 * Compte de connexion (voir BACKEND_SPEC.md §1 et §11.4).
 *
 * Fusionne ce qui était deux systèmes distincts côté frontend mock
 * (`AuthUser` dans features/auth/mock.ts vs. entités Encadrant/Stagiaire) :
 * ici, un compte User porte les identifiants de connexion (email, mot de
 * passe hashé, rôle), et référence optionnellement l'entité métier
 * correspondante via `encadrantId` / `stagiaireId`.
 *
 * - role = ADMIN  → encadrantId et stagiaireId restent null
 * - role = ENCADRANT → encadrantId pointe vers Encadrant.id
 * - role = STAGIAIRE → stagiaireId pointe vers Stagiaire.id
 *
 * Les colonnes `encadrantId`/`stagiaireId` sont volontairement de simples
 * colonnes numériques nullables (pas de relation TypeORM @ManyToOne) à ce
 * stade, pour ne pas créer de dépendance circulaire entre modules avant
 * que les entités Encadrant/Stagiaire existent. On pourra les convertir
 * en vraies relations une fois ces modules en place, si besoin.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  /** Mot de passe hashé (bcrypt) — jamais stocké ni renvoyé en clair. */
  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ type: 'int', nullable: true })
  encadrantId!: number | null;

  @Column({ type: 'int', nullable: true })
  stagiaireId!: number | null;

  /** Reprend la règle §1 du spec : un compte désactivé ne doit pas pouvoir se connecter. */
  @Column({ default: true })
  compteActif!: boolean;

  /**
   * Distingue un Admin complet (isSuperAdmin=true) d'un "Gestionnaire"
   * (isSuperAdmin=false) — décision prise en conversation. Les deux
   * partagent le même role=ADMIN (aucun changement sur common/enums/
   * role.enum.ts ni sur les guards déjà en place dans les 8 modules
   * existants), mais seul un isSuperAdmin peut créer de nouveaux comptes
   * internes (voir UsersController.create()). Sans rapport avec
   * Encadrant/Stagiaire, qui restent gérés indépendamment.
   */
  @Column({ default: false })
  isSuperAdmin!: boolean;

  /**
   * true = ce compte doit changer son mot de passe avant de pouvoir
   * utiliser l'application (voir ProtectedRoute côté frontend, qui bloque
   * toute navigation tant que ce flag est vrai). Mis à true à la création
   * de tout compte avec mot de passe par défaut prévisible (voir
   * default-password.util.ts — Utilisateur/Encadrant/Stagiaire), remis à
   * false par AuthService.changePassword(). Les comptes de démo créés par
   * les seeds (create-admin.seed.ts, etc.) le mettent explicitement à
   * false pour ne pas gêner les tests répétés avec des identifiants connus.
   */
  @Column({ default: true })
  mustChangePassword!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}