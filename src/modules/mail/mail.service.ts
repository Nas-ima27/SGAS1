import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly emailFrom: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.emailFrom = process.env.EMAIL_FROM || 'SGAS <onboarding@resend.dev>';
  }

  /**
   * Envoie les identifiants de connexion à un nouveau compte interne
   * (voir UsersService.create — module users, création d'un Utilisateur
   * avec isSuperAdmin, décision prise en conversation).
   *
   * Ne fait pas échouer la création du compte si l'email échoue (ex: quota
   * Resend dépassé, domaine non vérifié) — log l'erreur et continue,
   * plutôt que de bloquer tout le flux de création sur un problème externe.
   *
   * Retourne true/false selon que l'envoi a réussi : UsersService.create()
   * s'en sert pour décider s'il doit renvoyer le mot de passe temporaire
   * en clair dans la réponse (seul filet de sécurité si Resend échoue —
   * voir EMAIL_FROM en sandbox resend.dev, qui ne délivre qu'à l'adresse
   * du propriétaire du compte Resend, jamais à un destinataire arbitraire).
   */
  async sendCredentialsEmail(params: {
    to: string;
    nom: string;
    email: string;
    motDePasseTemporaire: string;
  }): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: params.to,
        subject: 'Vos identifiants de connexion SGAS',
        html: `
          <p>Bonjour ${params.nom},</p>
          <p>Un compte vous a été créé sur SGAS (Système de Gestion et d'Archivage des Stages).</p>
          <p>Voici vos identifiants de connexion :</p>
          <ul>
            <li><strong>Email</strong> : ${params.email}</li>
            <li><strong>Mot de passe temporaire</strong> : ${params.motDePasseTemporaire}</li>
          </ul>
          <p>Nous vous recommandons de changer ce mot de passe dès votre première connexion.</p>
        `,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Échec de l'envoi de l'email d'identifiants à ${params.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}