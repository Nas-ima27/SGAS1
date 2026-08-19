import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Permet à l'encadrant de commenter une entrée précise du journal de bord
 * de son stagiaire (voir JournalController.addComment) — auparavant le
 * journal était strictement lecture seule côté encadrant.
 */
export class AddCommentaireEncadrantToJournalEntries1787400000000
  implements MigrationInterface
{
  name = 'AddCommentaireEncadrantToJournalEntries1787400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_entries" ADD "commentaireEncadrant" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_entries" DROP COLUMN "commentaireEncadrant"`,
    );
  }
}
