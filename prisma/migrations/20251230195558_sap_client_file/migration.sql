-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PARSED', 'FAILED');

-- CreateTable
CREATE TABLE "SapSystem" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "landscape" TEXT,
    "vendor" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SapSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SapComponent" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "mainProduct" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SapComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SapSubComponent" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "vendor" TEXT,
    "os" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SapSubComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOADED',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SapSystem_sid_key" ON "SapSystem"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "SapComponent_systemId_name_version_key" ON "SapComponent"("systemId", "name", "version");

-- AddForeignKey
ALTER TABLE "SapComponent" ADD CONSTRAINT "SapComponent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SapSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SapSubComponent" ADD CONSTRAINT "SapSubComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "SapComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
