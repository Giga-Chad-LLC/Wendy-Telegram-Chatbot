/*
  Warnings:

  - The primary key for the `Questionnaire` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `age` on the `Questionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Questionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `residenceCity` on the `Questionnaire` table. All the data in the column will be lost.
  - Added the required column `bday` to the `Questionnaire` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `telegramUserId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Questionnaire_userId_key";

-- AlterTable
ALTER TABLE "Questionnaire" DROP CONSTRAINT "Questionnaire_pkey",
DROP COLUMN "age",
DROP COLUMN "id",
DROP COLUMN "residenceCity",
ADD COLUMN     "bday" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isAdult" SET DEFAULT false,
ADD CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramUserId",
ADD COLUMN     "telegramUserId" INTEGER NOT NULL;
