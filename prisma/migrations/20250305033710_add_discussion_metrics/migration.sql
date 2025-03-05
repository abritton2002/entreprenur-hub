-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discussionType" TEXT NOT NULL DEFAULT 'GENERAL',
    "validationScore" INTEGER NOT NULL DEFAULT 0,
    "potentialImpact" INTEGER NOT NULL DEFAULT 0,
    "complexityLevel" INTEGER NOT NULL DEFAULT 0,
    "collaborationPotential" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "industry" TEXT
);
INSERT INTO "new_Post" ("author", "content", "createdAt", "id", "likes", "title") SELECT "author", "content", "createdAt", "id", "likes", "title" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
