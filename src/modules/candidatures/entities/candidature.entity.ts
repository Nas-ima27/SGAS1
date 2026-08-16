import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CandidatureStatut } from '../enums/candidature-statut.enum';

/**
 * Voir BACKEND_SPEC.md §6 pour le modèle de base.
 *
 * IMPORTANT — écart volontaire par rapport au spec §6 tel qu'écrit :
 * un champ `stagiaireId` a été ajouté (absent du modèle Candidature du
 * document). Décision prise en cours de projet : le Stagiaire existe déjà
 * en base au moment où il postule (créé par l'Admin en amont, cf. workflow
 * réel — candidater ne crée pas un dossier stagiaire, ça choisit un sujet
 * pour un stagiaire déjà existant). stagiaireId est renseigné directement
 * à la création (le frontend le connaît via useAuth().user.id) plutôt que
 * d'être retrouvé par candidatEmail plus tard, plus fiable.
 *
 * Cela permet, à l'acceptation d'une candidature (statut → Acceptée), de
 * mettre à jour automatiquement le Stagiaire correspondant sans ambiguïté
 * (voir candidatures.service.ts) — décision prise en remplacement de la
 * question ouverte du spec ("faut-il déclencher automatiquement...").
 */
@Entity('candidatures')
export class Candidature {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    candidatName!: string;

  @Column()
    candidatEmail!: string;

  @Column({ type: 'int' })
    stagiaireId!: number;

  @Column({ type: 'int' })
    sujetId!: number;

  /** Dénormalisé pour affichage (voir §6 et §11.2 : cohérence à maintenir dans le service). */
  @Column()
    sujetTitre!: string;

  @Column()
    ecole!: string;

  @Column({ type: 'varchar', nullable: true })
    cvUrl!: string | null;

  @Column({
        type: 'enum',
        enum: CandidatureStatut,
        default: CandidatureStatut.EN_ATTENTE,
    })
    statut: CandidatureStatut = CandidatureStatut.EN_ATTENTE;

  @CreateDateColumn()
    dateCandidature!: Date;
}