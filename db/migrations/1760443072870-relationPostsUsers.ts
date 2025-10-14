import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationPostsUsers1760443072870 implements MigrationInterface {
  name = 'RelationPostsUsers1760443072870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`authorId\``);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`authorId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c5a322ad12a7bf95460c958e80e\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c5a322ad12a7bf95460c958e80e\``,
    );
    await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`authorId\``);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`authorId\` varchar(255) NOT NULL`,
    );
  }
}
