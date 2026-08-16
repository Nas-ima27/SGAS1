import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsSuperAdminToUsers1786531640866 implements MigrationInterface {
    name = 'AddIsSuperAdminToUsers1786531640866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isSuperAdmin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isSuperAdmin"`);
    }

}
