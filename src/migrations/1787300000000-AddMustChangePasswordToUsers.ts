import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * true = ce compte doit changer son mot de passe avant de pouvoir utiliser
 * l'app (voir ProtectedRoute côté frontend). Nécessaire depuis que le
 * premier mot de passe est un mot de passe par défaut PRÉVISIBLE (voir
 * default-password.util.ts) plutôt qu'envoyé par email.
 *
 * DEFAULT true s'applique aussi aux comptes déjà existants en base (ceux
 * créés avant cette migration) — sans l'UPDATE ci-dessous, ça bloquerait
 * au prochain login les comptes de démo documentés (admin/encadrant/
 * stagiaire, identifiants connus, réutilisés à chaque test) créés par les
 * seeds, ce qui n'est pas le comportement voulu pour eux : on les repasse
 * donc explicitement à false. Les seeds eux-mêmes sont aussi mis à jour
 * pour le faire directement à la création (voir create-*.seed.ts), cette
 * UPDATE ne sert donc que pour une base déjà provisionnée avant ce correctif.
 */
export class AddMustChangePasswordToUsers1787300000000 implements MigrationInterface {
  name = 'AddMustChangePasswordToUsers1787300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "mustChangePassword" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "mustChangePassword" = false WHERE "email" IN (
        'admin.royalairmaroc@sgas.ma',
        'karima.alaoui@sgas.ma',
        'sara.elamrani@emi.ac.ma'
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mustChangePassword"`);
  }
}
