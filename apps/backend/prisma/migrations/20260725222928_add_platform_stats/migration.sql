-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "rating" INTEGER,
    "solvedCount" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformStats_accountId_idx" ON "PlatformStats"("accountId");

-- CreateIndex
CREATE INDEX "PlatformStats_recordedAt_idx" ON "PlatformStats"("recordedAt");

-- AddForeignKey
ALTER TABLE "PlatformStats" ADD CONSTRAINT "PlatformStats_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
