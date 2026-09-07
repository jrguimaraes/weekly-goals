-- CreateTable
CREATE TABLE "week_reports" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "snapshot" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "week_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "week_reports_weekId_key" ON "week_reports"("weekId");

-- AddForeignKey
ALTER TABLE "week_reports" ADD CONSTRAINT "week_reports_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
