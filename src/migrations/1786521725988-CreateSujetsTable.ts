import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSujetsTable1786521725988 implements MigrationInterface {
    name = 'CreateSujetsTable1786521725988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sujets_statut_enum" AS ENUM('Brouillon', 'Publié', 'Clos')`);
        await queryRunner.query(`CREATE TABLE "sujets" ("id" SERIAL NOT NULL, "titre" character varying NOT NULL, "description" text, "departement" character varying NOT NULL, "encadrantId" integer NOT NULL, "encadrantName" character varying NOT NULL, "technologies" text array NOT NULL DEFAULT '{}', "statut" "public"."sujets_statut_enum" NOT NULL DEFAULT 'Brouillon', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6ee608739d5b66b80894d3d875a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sujets"`);
        await queryRunner.query(`DROP TYPE "public"."sujets_statut_enum"`);
    }

}
