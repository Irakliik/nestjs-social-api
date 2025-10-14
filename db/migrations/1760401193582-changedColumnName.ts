import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedColumnName1760401193582 implements MigrationInterface {
  name = 'ChangedColumnName1760401193582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`createdAt\` \`dateCreated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`dateCreated\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
  }
}
