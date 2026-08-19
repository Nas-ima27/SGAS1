import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeStageAndTypeCandidat1787127569056 implements MigrationInterface {
    name = 'AddTypeStageAndTypeCandidat1787127569056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stagiaires_typestage_enum" AS ENUM('PFA', 'PFE')`);
        await queryRunner.query(`ALTER TABLE "stagiaires" ADD "typeStage" "public"."stagiaires_typestage_enum" NOT NULL DEFAULT 'PFA'`);
        await queryRunner.query(`CREATE TYPE "public"."sujets_typecandidat_enum" AS ENUM('PFA', 'PFE', 'PFA et PFE')`);
        await queryRunner.query(`ALTER TABLE "sujets" ADD "typeCandidat" "public"."sujets_typecandidat_enum" NOT NULL DEFAULT 'PFA et PFE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sujets" DROP COLUMN "typeCandidat"`);
        await queryRunner.query(`DROP TYPE "public"."sujets_typecandidat_enum"`);
        await queryRunner.query(`ALTER TABLE "stagiaires" DROP COLUMN "typeStage"`);
        await queryRunner.query(`DROP TYPE "public"."stagiaires_typestage_enum"`);
    }

}
