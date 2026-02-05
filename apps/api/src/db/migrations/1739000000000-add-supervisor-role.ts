import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupervisorRole1739000000000
  implements MigrationInterface
{
  name = 'AddSupervisorRole1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'users_role_enum'
            AND e.enumlabel = 'SUPERVISOR'
        ) THEN
          ALTER TYPE "users_role_enum" ADD VALUE 'SUPERVISOR';
        END IF;
      END $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL enums cannot drop values safely; no-op.
  }
}