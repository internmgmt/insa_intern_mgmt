import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScoreAndFeedbackToSubmissions1740220000001
  implements MigrationInterface
{
  name = 'AddScoreAndFeedbackToSubmissions1740220000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      ADD COLUMN IF NOT EXISTS "score" integer,
      ADD COLUMN IF NOT EXISTS "feedback" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      DROP COLUMN IF EXISTS "score",
      DROP COLUMN IF EXISTS "feedback"
    `);
  }
}
