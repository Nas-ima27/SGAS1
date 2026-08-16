import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCandidaturesTable1786522692401 implements MigrationInterface {
    name = 'CreateCandidaturesTable1786522692401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."candidatures_statut_enum" AS ENUM('En attente', 'Acceptée', 'Refusée')`);
        await queryRunner.query(`CREATE TABLE "candidatures" ("id" SERIAL NOT NULL, "candidatName" character varying NOT NULL, "candidatEmail" character varying NOT NULL, "stagiaireId" integer NOT NULL, "sujetId" integer NOT NULL, "sujetTitre" character varying NOT NULL, "ecole" character varying NOT NULL, "cvUrl" character varying, "statut" "public"."candidatures_statut_enum" NOT NULL DEFAULT 'En attente', "dateCandidature" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d3816f972665a5f0b67e0fbf7d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "candidatures"`);
        await queryRunner.query(`DROP TYPE "public"."candidatures_statut_enum"`);
    }

}
