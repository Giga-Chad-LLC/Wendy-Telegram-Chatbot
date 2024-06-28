-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramFirstName" TEXT NOT NULL,
    "telegramLastName" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "telegramChatId" INTEGER NOT NULL,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "preferredName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "age" INTEGER,
    "isAdult" BOOLEAN NOT NULL,
    "residenceCountry" TEXT NOT NULL,
    "residenceCity" TEXT,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "sent" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEdited" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringChatNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dayTimepoint" INTEGER NOT NULL,

    CONSTRAINT "RecurringChatNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramChatId_key" ON "User"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "Questionnaire_userId_key" ON "Questionnaire"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_userId_key" ON "ChatMessage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringChatNotification_userId_key" ON "RecurringChatNotification"("userId");

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringChatNotification" ADD CONSTRAINT "RecurringChatNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
