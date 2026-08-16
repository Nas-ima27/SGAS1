import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEncadrantsTable1786489718770 implements MigrationInterface {
    name = 'CreateEncadrantsTable1786489718770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "encadrants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "title" character varying NOT NULL, "departement" character varying NOT NULL, "email" character varying NOT NULL, "telephone" character varying, "compteActif" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f3eb1db19f2b6cf15a7a77de98" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "encadrants"`);
    }

}
