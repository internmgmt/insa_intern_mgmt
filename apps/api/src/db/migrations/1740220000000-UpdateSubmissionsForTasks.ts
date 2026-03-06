import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSubmissionsForTasks1740220000000
  implements MigrationInterface
{
  name = 'UpdateSubmissionsForTasks1740220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add types to enum if they don't exist
    // Note: SubmissionStatus and SubmissionType are enums in TS but maybe VARCHAR in DB or actual Postgres Enums.
    // Let's check existing DB state by looking at the entities.
    
    // According to the specification, they should be VARCHAR or ENUM. 
    // If they are ENUM, we need to update the types.
    
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      ALTER COLUMN "student_id" DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS "type" varchar(50) DEFAULT 'DOCUMENT',
      ADD COLUMN IF NOT EXISTS "assigned_by" uuid,
      ADD CONSTRAINT "FK_submissions_assigned_by" 
      FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Add ASSIGNED to status if it's an enum
    // If it's a varchar, we don't need to do anything special. 
    // Let's assume it might be an enum called submissions_status_enum.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submissions_status_enum') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e 
            JOIN pg_type t ON t.oid = e.enumtypid 
            WHERE t.typname = 'submissions_status_enum' AND e.enumlabel = 'ASSIGNED'
          ) THEN
            ALTER TYPE "submissions_status_enum" ADD VALUE 'ASSIGNED';
          END IF;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT IF EXISTS "FK_submissions_assigned_by"`);
    await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN IF EXISTS "assigned_by"`);
    await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN IF EXISTS "type"`);
    await queryRunner.query(`ALTER TABLE "submissions" ALTER COLUMN "student_id" SET NOT NULL`);
  }
}
