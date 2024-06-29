/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Questionnaire" DROP CONSTRAINT "Questionnaire_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringChatNotification" DROP CONSTRAINT "RecurringChatNotification_userId_fkey";

-- DropIndex
DROP INDEX "User_telegramUserId_key";

-- AlterTable
CREATE SEQUENCE user_telegramuserid_seq;
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ALTER COLUMN "telegramUserId" SET DEFAULT nextval('user_telegramuserid_seq'),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("telegramUserId");
ALTER SEQUENCE user_telegramuserid_seq OWNED BY "User"."telegramUserId";

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringChatNotification" ADD CONSTRAINT "RecurringChatNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramUserId") ON DELETE CASCADE ON UPDATE CASCADE;
