import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CORRECTIF — la fonction ensure_unique_account_email() (voir migration
 * EnforceUniqueAccountEmails) bloquait à tort la création du compte User
 * lié à un Encadrant/Stagiaire quand ils partagent le même email : c'est
 * pourtant le schéma voulu (compte de login lié à la fiche métier), pas
 * un doublon. On autorise désormais explicitement cette paire liée via
 * users."encadrantId" / users."stagiaireId", tout en continuant à
 * bloquer les vrais doublons (email réutilisé par une entité différente).
 */
export class FixUniqueAccountEmailAllowLinkedPair1787200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ensure_unique_account_email()
      RETURNS trigger AS $$
      DECLARE
        conflict_exists boolean;
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtext(LOWER(NEW.email)));

        IF TG_TABLE_NAME = 'users' THEN
          SELECT EXISTS (
            SELECT 1 FROM "users"
            WHERE LOWER("email") = LOWER(NEW.email) AND "id" <> NEW.id
            UNION ALL
            SELECT 1 FROM "stagiaires"
            WHERE LOWER("email") = LOWER(NEW.email)
              AND (NEW."stagiaireId" IS NULL OR "id" <> NEW."stagiaireId")
            UNION ALL
            SELECT 1 FROM "encadrants"
            WHERE LOWER("email") = LOWER(NEW.email)
              AND (NEW."encadrantId" IS NULL OR "id" <> NEW."encadrantId")
          ) INTO conflict_exists;
        ELSIF TG_TABLE_NAME = 'stagiaires' THEN
          SELECT EXISTS (
            SELECT 1 FROM "users"
            WHERE LOWER("email") = LOWER(NEW.email)
              AND "stagiaireId" IS DISTINCT FROM NEW.id
            UNION ALL
            SELECT 1 FROM "stagiaires"
            WHERE LOWER("email") = LOWER(NEW.email) AND "id" <> NEW.id
            UNION ALL
            SELECT 1 FROM "encadrants"
            WHERE LOWER("email") = LOWER(NEW.email)
          ) INTO conflict_exists;
        ELSE
          -- TG_TABLE_NAME = 'encadrants'
          SELECT EXISTS (
            SELECT 1 FROM "users"
            WHERE LOWER("email") = LOWER(NEW.email)
              AND "encadrantId" IS DISTINCT FROM NEW.id
            UNION ALL
            SELECT 1 FROM "encadrants"
            WHERE LOWER("email") = LOWER(NEW.email) AND "id" <> NEW.id
            UNION ALL
            SELECT 1 FROM "stagiaires"
            WHERE LOWER("email") = LOWER(NEW.email)
          ) INTO conflict_exists;
        END IF;

        IF conflict_exists THEN
          RAISE EXCEPTION 'A user account already exists with this email.'
            USING ERRCODE = 'unique_violation';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
  }
}
