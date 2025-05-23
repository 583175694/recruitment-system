import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubjects1622000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create SubjectType enum type
    await queryRunner.query(`
      CREATE TYPE "subject_type_enum" AS ENUM ('语文', '数学', '英语');
    `);

    // Create subject table
    await queryRunner.query(`
      CREATE TABLE "subject" (
        "id" SERIAL NOT NULL,
        "name" "subject_type_enum" NOT NULL,
        "scoreType" "score_type_enum" NOT NULL DEFAULT 'numeric',
        "score" float NULL,
        "grade" character varying(10) NULL,
        "exam_score_id" integer,
        CONSTRAINT "PK_subject" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "subject" 
      ADD CONSTRAINT "FK_subject_exam_score" 
      FOREIGN KEY ("exam_score_id") 
      REFERENCES "exam_score"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Modify exam_score table - remove scoreType, score, and grade columns
    await queryRunner.query(`
      ALTER TABLE "exam_score" DROP COLUMN "scoreType";
      ALTER TABLE "exam_score" DROP COLUMN "score";
      ALTER TABLE "exam_score" DROP COLUMN "grade";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the columns to exam_score table
    await queryRunner.query(`
      ALTER TABLE "exam_score" 
      ADD COLUMN "scoreType" "score_type_enum" NOT NULL DEFAULT 'numeric',
      ADD COLUMN "score" float NULL,
      ADD COLUMN "grade" character varying(10) NULL
    `);

    // Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "subject" DROP CONSTRAINT "FK_subject_exam_score"
    `);

    // Drop the subject table
    await queryRunner.query(`
      DROP TABLE "subject"
    `);

    // Drop the SubjectType enum
    await queryRunner.query(`
      DROP TYPE "subject_type_enum"
    `);
  }
} 