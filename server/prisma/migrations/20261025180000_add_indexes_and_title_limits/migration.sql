-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "title" SET DATA TYPE VARCHAR(200);

-- CreateIndex
CREATE INDEX "Column_boardId_position_idx" ON "Column"("boardId", "position");

-- CreateIndex
CREATE INDEX "Card_columnId_position_idx" ON "Card"("columnId", "position");
