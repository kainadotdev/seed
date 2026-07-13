-- CreateEnum
CREATE TYPE "SeedType" AS ENUM ('PENSAMENTO', 'PROJETO', 'DOCUMENTO', 'OBJETIVO', 'CHECKLIST', 'DIARIO', 'ARTIGO', 'LIVRO', 'PLANEJAMENTO');

-- CreateEnum
CREATE TYPE "SeedStatus" AS ENUM ('SEMENTE', 'CRESCENDO', 'PROJETO', 'COLHIDA');

-- CreateEnum
CREATE TYPE "SeedVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seeds" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "SeedType" NOT NULL DEFAULT 'PENSAMENTO',
    "status" "SeedStatus" NOT NULL DEFAULT 'SEMENTE',
    "visibility" "SeedVisibility" NOT NULL DEFAULT 'PRIVATE',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "seedId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_seeds" (
    "id" TEXT NOT NULL,
    "seedId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_seeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seed_versions" (
    "id" TEXT NOT NULL,
    "seedId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seed_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "seedId" TEXT,
    "userId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "seeds_ownerId_idx" ON "seeds"("ownerId");

-- CreateIndex
CREATE INDEX "seeds_visibility_idx" ON "seeds"("visibility");

-- CreateIndex
CREATE INDEX "comments_seedId_idx" ON "comments"("seedId");

-- CreateIndex
CREATE INDEX "saved_seeds_userId_idx" ON "saved_seeds"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_seeds_seedId_userId_key" ON "saved_seeds"("seedId", "userId");

-- CreateIndex
CREATE INDEX "seed_versions_seedId_idx" ON "seed_versions"("seedId");

-- CreateIndex
CREATE INDEX "ai_conversations_seedId_idx" ON "ai_conversations"("seedId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seeds" ADD CONSTRAINT "seeds_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "seeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_seeds" ADD CONSTRAINT "saved_seeds_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "seeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_seeds" ADD CONSTRAINT "saved_seeds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_versions" ADD CONSTRAINT "seed_versions_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "seeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "seeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
