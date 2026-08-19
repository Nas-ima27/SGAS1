import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Table des tâches assignées par un encadrant à son stagiaire (voir
 * TachesController — "envoyer des tâches à faire à son stagiaire").
 */
export class CreateTachesTable1787500000000 implements MigrationInterface {
  name = 'CreateTachesTable1787500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."taches_statut_enum" AS ENUM('À faire', 'Faite')`,
    );
    await queryRunner.query(
      `CREATE TABLE "taches" (
        "id" SERIAL NOT NULL,
        "stagiaireId" integer NOT NULL,
        "titre" character varying NOT NULL,
        "description" text,
        "statut" "public"."taches_statut_enum" NOT NULL DEFAULT 'À faire',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_taches_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "taches"`);
    await queryRunner.query(`DROP TYPE "public"."taches_statut_enum"`);
  }
}
