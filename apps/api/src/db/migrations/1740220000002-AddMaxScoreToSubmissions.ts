import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxScoreToSubmissions1740220000002
  implements MigrationInterface
{
  name = 'AddMaxScoreToSubmissions1740220000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      ADD COLUMN IF NOT EXISTS "max_score" integer DEFAULT 100
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      DROP COLUMN IF EXISTS "max_score"
    `);
  }
}
