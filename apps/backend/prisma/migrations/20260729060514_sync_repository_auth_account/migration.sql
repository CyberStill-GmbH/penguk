/*
  Warnings:

  - You are about to drop the column `type` on the `Repository` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `AuthAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubRepositoryId]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `AuthAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AuthAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `AuthAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultBranch` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `githubRepositoryId` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthAccount" ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "type",
ADD COLUMN     "defaultBranch" TEXT NOT NULL,
ADD COLUMN     "githubRepositoryId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "owner" TEXT NOT NULL;

-- DropEnum
DROP TYPE "RepositoryType";

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_userId_key" ON "AuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubRepositoryId_key" ON "Repository"("githubRepositoryId");
