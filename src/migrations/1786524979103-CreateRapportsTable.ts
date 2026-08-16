import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRapportsTable1786524979103 implements MigrationInterface {
    name = 'CreateRapportsTable1786524979103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rapports_statut_enum" AS ENUM('En attente de validation', 'Corrections demandées', 'Validé')`);
        await queryRunner.query(`CREATE TABLE "rapports" ("id" SERIAL NOT NULL, "titre" character varying NOT NULL, "resume" text NOT NULL, "auteur" character varying NOT NULL, "ecole" character varying NOT NULL, "encadrant" character varying NOT NULL, "departement" character varying NOT NULL, "technologies" text array NOT NULL DEFAULT '{}', "annee" integer NOT NULL, "statut" "public"."rapports_statut_enum" NOT NULL DEFAULT 'En attente de validation', "dateValidation" TIMESTAMP, "fichierUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e640b8f0f316660199f4207d676" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rapports"`);
        await queryRunner.query(`DROP TYPE "public"."rapports_statut_enum"`);
    }

}
