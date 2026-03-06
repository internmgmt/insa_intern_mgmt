import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMentorRoleAndColumn1740212000000
  implements MigrationInterface
{
  name = 'AddMentorRoleAndColumn1740212000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add MENTOR to users_role_enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'users_role_enum'
            AND e.enumlabel = 'MENTOR'
        ) THEN
          ALTER TYPE "users_role_enum" ADD VALUE 'MENTOR';
        END IF;
      END $$;
    `);

    // 2. Add assigned_mentor_id to interns table if not exists
    const hasColumn = await queryRunner.hasColumn('interns', 'assigned_mentor_id');
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "interns" 
        ADD COLUMN "assigned_mentor_id" uuid,
        ADD CONSTRAINT "FK_interns_mentor" 
        FOREIGN KEY ("assigned_mentor_id") 
        REFERENCES "users"("id") ON DELETE SET NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the constraint and column
    const hasColumn = await queryRunner.hasColumn('interns', 'assigned_mentor_id');
    if (hasColumn) {
      await queryRunner.query(`ALTER TABLE "interns" DROP CONSTRAINT IF EXISTS "FK_interns_mentor"`);
      await queryRunner.query(`ALTER TABLE "interns" DROP COLUMN "assigned_mentor_id"`);
    }
    // PostgreSQL enums cannot drop values safely
  }
}
