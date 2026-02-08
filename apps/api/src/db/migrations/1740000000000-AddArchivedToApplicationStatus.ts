import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArchivedToApplicationStatus1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ARCHIVED value to the applications status enum if it's missing
    // Using IF NOT EXISTS to be idempotent on newer Postgres versions
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'applications_status_enum' AND e.enumlabel = 'ARCHIVED'
      ) THEN
        ALTER TYPE "applications_status_enum" ADD VALUE 'ARCHIVED';
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Removing an enum value is non-trivial and unsafe in many deployments.
    // Intentionally left blank. If you must revert, create a migration
    // that recreates the enum without the ARCHIVED value and migrates data out.
  }
}
