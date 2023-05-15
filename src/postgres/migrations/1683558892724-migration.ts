import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1683558892724 implements MigrationInterface {
    name = 'Migration1683558892724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation_info" ("userId" uuid NOT NULL, "confirmationCode" uuid NOT NULL DEFAULT uuid_generate_v4(), "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isConfirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f6f5a164820c2b6020e3352dde1" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "password_recovery_info" ("userId" uuid NOT NULL, "recoveryCode" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_e41a883301d05dddf1e42a87132" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "ban_info" ("userId" uuid NOT NULL, "isBanned" boolean NOT NULL DEFAULT false, "banDate" character varying, "banReason" character varying, CONSTRAINT "PK_a7b316fecc756363a039a123545" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "comment_like_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "commentId" uuid NOT NULL, CONSTRAINT "PK_033f9eb48387c4e6b6a98c247c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "userLogin" character varying NOT NULL, "postId" uuid NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_like_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "postId" uuid NOT NULL, CONSTRAINT "PK_22aaf8c69127908100dbfa96d9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "shortDescription" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "blogId" uuid NOT NULL, "blogName" character varying NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ban_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blogId" uuid NOT NULL, "bloggerId" character varying NOT NULL, "userId" uuid NOT NULL, "userLogin" character varying NOT NULL, "banReason" character varying NOT NULL, "banDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isBanned" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_254e6505a0c04353c98d52457cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blog_ban_info" ("blogId" uuid NOT NULL, "isBanned" boolean NOT NULL DEFAULT false, "banDate" character varying, CONSTRAINT "PK_5368730149fe844c998658e3934" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`CREATE TABLE "blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isMembership" boolean NOT NULL DEFAULT false, "bloggerId" uuid NOT NULL, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "device" ("deviceId" character varying NOT NULL, "deviceIp" character varying NOT NULL, "deviceTitle" character varying, "lastActiveDate" integer NOT NULL, "expirationDate" integer NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_6fe2df6e1c34fc6c18c786ca26e" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."answer_answerstatus_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`CREATE TABLE "answer" ("id" uuid NOT NULL, "body" character varying NOT NULL, "playerId" uuid NOT NULL, "questionId" uuid NOT NULL, "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "answerStatus" "public"."answer_answerstatus_enum" NOT NULL, CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "gameId" uuid NOT NULL, "userId" uuid NOT NULL, "score" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8a99208b9d03cf5c1fbf9a391b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."game_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`);
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL, "status" "public"."game_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer', "pairCreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "startGameDate" TIMESTAMP WITH TIME ZONE, "finishGameDate" TIMESTAMP WITH TIME ZONE, "firstPlayerProgressId" uuid NOT NULL, "secondPlayerProgressId" uuid, CONSTRAINT "REL_37d446099bd84035d5ffba4f9a" UNIQUE ("firstPlayerProgressId"), CONSTRAINT "REL_3eb54dc351599de6d620c66aea" UNIQUE ("secondPlayerProgressId"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_of_game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "gameId" uuid NOT NULL, "questionId" uuid NOT NULL, "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b6cdb737a6fcfe3727afd1f1c86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying NOT NULL, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE, "correctAnswers" character varying array NOT NULL, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_info" ADD CONSTRAINT "FK_f6f5a164820c2b6020e3352dde1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_recovery_info" ADD CONSTRAINT "FK_e41a883301d05dddf1e42a87132" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban_info" ADD CONSTRAINT "FK_a7b316fecc756363a039a123545" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like_status" ADD CONSTRAINT "FK_7239a6640d6a515a4e01601fc32" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like_status" ADD CONSTRAINT "FK_6664d48d2e27c43d4391daeb6b2" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like_status" ADD CONSTRAINT "FK_f306ec8cbd8f0292c01bdebb2db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like_status" ADD CONSTRAINT "FK_a2c8e0cffd9851d0be79fca1b37" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban_list" ADD CONSTRAINT "FK_9cfc78968c618c897a7120ed867" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban_list" ADD CONSTRAINT "FK_d6c1fe6f4d03547dc3f74785dda" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blog_ban_info" ADD CONSTRAINT "FK_5368730149fe844c998658e3934" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blog" ADD CONSTRAINT "FK_0cca86006e5be6fae0c259be9bb" FOREIGN KEY ("bloggerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_d0dab0006c7c8f3aea3fe5eaf85" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75" FOREIGN KEY ("playerId") REFERENCES "player_progress"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_progress" ADD CONSTRAINT "FK_95d7e640b22ab0b9e0054cc4282" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_37d446099bd84035d5ffba4f9a9" FOREIGN KEY ("firstPlayerProgressId") REFERENCES "player_progress"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_3eb54dc351599de6d620c66aeac" FOREIGN KEY ("secondPlayerProgressId") REFERENCES "player_progress"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "question_of_game" ADD CONSTRAINT "FK_2df0b0d7a557f39f1833d0bd8da" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_of_game" ADD CONSTRAINT "FK_48243a2127dec036312bda9a2ce" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_of_game" DROP CONSTRAINT "FK_48243a2127dec036312bda9a2ce"`);
        await queryRunner.query(`ALTER TABLE "question_of_game" DROP CONSTRAINT "FK_2df0b0d7a557f39f1833d0bd8da"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_3eb54dc351599de6d620c66aeac"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_37d446099bd84035d5ffba4f9a9"`);
        await queryRunner.query(`ALTER TABLE "player_progress" DROP CONSTRAINT "FK_95d7e640b22ab0b9e0054cc4282"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_d0dab0006c7c8f3aea3fe5eaf85"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP CONSTRAINT "FK_0cca86006e5be6fae0c259be9bb"`);
        await queryRunner.query(`ALTER TABLE "blog_ban_info" DROP CONSTRAINT "FK_5368730149fe844c998658e3934"`);
        await queryRunner.query(`ALTER TABLE "ban_list" DROP CONSTRAINT "FK_d6c1fe6f4d03547dc3f74785dda"`);
        await queryRunner.query(`ALTER TABLE "ban_list" DROP CONSTRAINT "FK_9cfc78968c618c897a7120ed867"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`);
        await queryRunner.query(`ALTER TABLE "post_like_status" DROP CONSTRAINT "FK_a2c8e0cffd9851d0be79fca1b37"`);
        await queryRunner.query(`ALTER TABLE "post_like_status" DROP CONSTRAINT "FK_f306ec8cbd8f0292c01bdebb2db"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "comment_like_status" DROP CONSTRAINT "FK_6664d48d2e27c43d4391daeb6b2"`);
        await queryRunner.query(`ALTER TABLE "comment_like_status" DROP CONSTRAINT "FK_7239a6640d6a515a4e01601fc32"`);
        await queryRunner.query(`ALTER TABLE "ban_info" DROP CONSTRAINT "FK_a7b316fecc756363a039a123545"`);
        await queryRunner.query(`ALTER TABLE "password_recovery_info" DROP CONSTRAINT "FK_e41a883301d05dddf1e42a87132"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_info" DROP CONSTRAINT "FK_f6f5a164820c2b6020e3352dde1"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "question_of_game"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TYPE "public"."game_status_enum"`);
        await queryRunner.query(`DROP TABLE "player_progress"`);
        await queryRunner.query(`DROP TABLE "answer"`);
        await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "device"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP TABLE "blog_ban_info"`);
        await queryRunner.query(`DROP TABLE "ban_list"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "post_like_status"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "comment_like_status"`);
        await queryRunner.query(`DROP TABLE "ban_info"`);
        await queryRunner.query(`DROP TABLE "password_recovery_info"`);
        await queryRunner.query(`DROP TABLE "email_confirmation_info"`);
    }

}
