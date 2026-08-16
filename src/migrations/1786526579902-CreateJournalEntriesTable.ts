import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJournalEntriesTable1786526579902 implements MigrationInterface {
    name = 'CreateJournalEntriesTable1786526579902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."journal_entries_type_enum" AS ENUM('Journalier', 'Hebdomadaire')`);
        await queryRunner.query(`CREATE TABLE "journal_entries" ("id" SERIAL NOT NULL, "stagiaireId" integer NOT NULL, "type" "public"."journal_entries_type_enum" NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "contenu" text NOT NULL, CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "journal_entries"`);
        await queryRunner.query(`DROP TYPE "public"."journal_entries_type_enum"`);
    }

}
