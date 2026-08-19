import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnforceUniqueAccountEmails1786535000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ensure_unique_account_email()
      RETURNS trigger AS $$
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtext(LOWER(NEW.email)));
        IF EXISTS (
          SELECT 1 FROM "users"
          WHERE LOWER("email") = LOWER(NEW.email)
            AND (TG_TABLE_NAME <> 'users' OR "id" <> NEW.id)
          UNION ALL
          SELECT 1 FROM "stagiaires"
          WHERE LOWER("email") = LOWER(NEW.email)
            AND (TG_TABLE_NAME <> 'stagiaires' OR "id" <> NEW.id)
          UNION ALL
          SELECT 1 FROM "encadrants"
          WHERE LOWER("email") = LOWER(NEW.email)
            AND (TG_TABLE_NAME <> 'encadrants' OR "id" <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'A user account already exists with this email.'
            USING ERRCODE = 'unique_violation';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    for (const table of ['users', 'stagiaires', 'encadrants']) {
      await queryRunner.query(`
        CREATE TRIGGER "TRG_${table}_unique_account_email"
        BEFORE INSERT OR UPDATE OF "email" ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION ensure_unique_account_email();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['users', 'stagiaires', 'encadrants']) {
      await queryRunner.query(
        `DROP TRIGGER IF EXISTS "TRG_${table}_unique_account_email" ON "${table}";`,
      );
    }
    await queryRunner.query('DROP FUNCTION IF EXISTS ensure_unique_account_email();');
  }
}
