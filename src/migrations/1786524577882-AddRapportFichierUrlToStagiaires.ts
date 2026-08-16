import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRapportFichierUrlToStagiaires1786524577882 implements MigrationInterface {
    name = 'AddRapportFichierUrlToStagiaires1786524577882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stagiaires" ADD "rapportFichierUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stagiaires" DROP COLUMN "rapportFichierUrl"`);
    }

}
