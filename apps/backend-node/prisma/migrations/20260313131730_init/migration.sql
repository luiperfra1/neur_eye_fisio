-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SessionTestStatus" AS ENUM ('pending', 'completed', 'skipped');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scales" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30),
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "estimated_duration_min" INTEGER,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_sections" (
    "id" UUID NOT NULL,
    "scale_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "scale_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_tests" (
    "id" UUID NOT NULL,
    "scale_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "score_values" TEXT NOT NULL,
    "score_labels" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "scale_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "patient_id" VARCHAR(80) NOT NULL,
    "scale_id" UUID NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'draft',
    "started_at" TIMESTAMP(6),
    "ended_at" TIMESTAMP(6),
    "general_comments" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_test_results" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "scale_test_id" UUID NOT NULL,
    "score_value" DECIMAL(5,2),
    "notes" TEXT,
    "transcript_text" TEXT,
    "audio_url" TEXT,
    "duration_sec" INTEGER,
    "status" "SessionTestStatus" NOT NULL DEFAULT 'pending',
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "scales_code_key" ON "scales"("code");

-- CreateIndex
CREATE INDEX "scale_sections_scale_id_is_default_idx" ON "scale_sections"("scale_id", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "scale_sections_scale_id_order_index_key" ON "scale_sections"("scale_id", "order_index");

-- CreateIndex
CREATE INDEX "scale_tests_scale_id_section_id_order_index_idx" ON "scale_tests"("scale_id", "section_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "scale_tests_scale_id_order_index_key" ON "scale_tests"("scale_id", "order_index");

-- CreateIndex
CREATE INDEX "sessions_user_id_created_at_idx" ON "sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sessions_status_created_at_idx" ON "sessions"("status", "created_at");

-- CreateIndex
CREATE INDEX "session_test_results_session_id_order_index_idx" ON "session_test_results"("session_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "session_test_results_session_id_scale_test_id_key" ON "session_test_results"("session_id", "scale_test_id");

-- AddForeignKey
ALTER TABLE "scale_sections" ADD CONSTRAINT "scale_sections_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_tests" ADD CONSTRAINT "scale_tests_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_tests" ADD CONSTRAINT "scale_tests_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "scale_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_test_results" ADD CONSTRAINT "session_test_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_test_results" ADD CONSTRAINT "session_test_results_scale_test_id_fkey" FOREIGN KEY ("scale_test_id") REFERENCES "scale_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
