import { PrismaClient } from "../../app/generated/prisma/client";

export async function categorySeeder(prisma: PrismaClient) {
  const data = [
    { name: "Fiksi & Sastra" },
    { name: "Teknologi & Komputer" },
    { name: "Pengembangan Diri" },
    { name: "Bisnis & Ekonomi" },
    { name: "Desain & Kreativitas" },
    { name: "Psikologi & Kesehatan" },
    { name: "Filsafat & Pemikiran" },
  ];
  console.log("Seeding categories...");

  await prisma.category.createMany({
    data,
    skipDuplicates: true,
  });
}
