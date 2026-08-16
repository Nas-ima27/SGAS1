import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUtilisateursTable1786533830067 implements MigrationInterface {
    name = 'CreateUtilisateursTable1786533830067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."utilisateurs_status_enum" AS ENUM('Actif', 'Inactif')`);
        await queryRunner.query(`CREATE TABLE "utilisateurs" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "service" character varying NOT NULL, "status" "public"."utilisateurs_status_enum" NOT NULL DEFAULT 'Actif', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d3c39b551c51a0bdc76e07b9197" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "utilisateurs"`);
        await queryRunner.query(`DROP TYPE "public"."utilisateurs_status_enum"`);
    }

}
