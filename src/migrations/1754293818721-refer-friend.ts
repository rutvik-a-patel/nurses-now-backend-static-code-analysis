import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReferFriend1754293818721 implements MigrationInterface {
  name = 'ReferFriend1754293818721';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."refer_friend_status_enum" AS ENUM('invited', 'active', 'in_active', 'onboarding')`,
    );
    await queryRunner.query(
      `CREATE TABLE "refer_friend" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "full_name" character varying, "email" character varying, "country_code" character varying(5), "mobile_no" character varying(25), "status" "public"."refer_friend_status_enum" NOT NULL DEFAULT 'invited', "referred_by" uuid, CONSTRAINT "PK_2d40822df163acab7eaf3284403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refer_friend" ADD CONSTRAINT "FK_0aa5a66dd77cd05ba9a9b967d3a" FOREIGN KEY ("referred_by") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refer_friend" DROP CONSTRAINT "FK_0aa5a66dd77cd05ba9a9b967d3a"`,
    );
    await queryRunner.query(`DROP TABLE "refer_friend"`);
    await queryRunner.query(`DROP TYPE "public"."refer_friend_status_enum"`);
  }
}
