/*
  Warnings:

  - You are about to drop the column `imageId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `imagePath` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_imageId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "imageId",
ADD COLUMN     "imagePath" TEXT NOT NULL;

-- DropTable
DROP TABLE "Image";
