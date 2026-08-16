import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStagiairesTable1786479914514 implements MigrationInterface {
    name = 'CreateStagiairesTable1786479914514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stagiaires_statut_enum" AS ENUM('À venir', 'En cours', 'Terminé')`);
        await queryRunner.query(`CREATE TYPE "public"."stagiaires_rapportstatut_enum" AS ENUM('Non déposé', 'En attente', 'Corrections demandées', 'Validé')`);
        await queryRunner.query(`CREATE TABLE "stagiaires" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "telephone" character varying, "linkedin" character varying, "github" character varying, "bio" text, "ecole" character varying NOT NULL, "filiere" character varying NOT NULL, "departement" character varying NOT NULL, "encadrantId" integer, "encadrantName" character varying, "dateDebut" date NOT NULL, "dateFin" date NOT NULL, "avancement" integer NOT NULL DEFAULT '0', "statut" "public"."stagiaires_statut_enum" NOT NULL DEFAULT 'À venir', "rapportStatut" "public"."stagiaires_rapportstatut_enum" NOT NULL DEFAULT 'Non déposé', "rapportFichierNom" character varying, "rapportDateDepot" TIMESTAMP, "rapportCommentaire" text, "sujetId" integer, "compteActif" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_68ac98bbda6ca0b4ac33578e0ca" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stagiaires"`);
        await queryRunner.query(`DROP TYPE "public"."stagiaires_rapportstatut_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stagiaires_statut_enum"`);
    }

}
