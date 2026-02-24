/*
  Warnings:

  - Made the column `name` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "name" SET NOT NULL;
