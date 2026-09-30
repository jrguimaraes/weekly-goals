-- CreateTable
CREATE TABLE "recurring_goals" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GoalType" NOT NULL,
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "targetValue" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_goals_categoryId_idx" ON "recurring_goals"("categoryId");

-- AddForeignKey
ALTER TABLE "recurring_goals" ADD CONSTRAINT "recurring_goals_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
