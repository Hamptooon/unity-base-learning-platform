-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('NEWBIE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PartType" AS ENUM ('THEORETICAL', 'PRACTICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "github_id" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preview_image_url" TEXT,
    "prerequisites" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'NEWBIE',
    "duration" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_learning_objectives" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_learning_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_parts" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "preview_image_url" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PartType" NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "course_article_id" TEXT,
    "course_practice_task_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_articles" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_practices" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_practices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");

-- CreateIndex
CREATE INDEX "courses_title_idx" ON "courses"("title");

-- CreateIndex
CREATE UNIQUE INDEX "course_parts_course_article_id_key" ON "course_parts"("course_article_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_parts_course_practice_task_id_key" ON "course_parts"("course_practice_task_id");

-- AddForeignKey
ALTER TABLE "course_learning_objectives" ADD CONSTRAINT "course_learning_objectives_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_course_article_id_fkey" FOREIGN KEY ("course_article_id") REFERENCES "course_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_course_practice_task_id_fkey" FOREIGN KEY ("course_practice_task_id") REFERENCES "course_practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
