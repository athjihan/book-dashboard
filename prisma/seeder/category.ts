import { PrismaClient } from "../../app/generated/prisma/client";

export async function categorySeeder(prisma: PrismaClient) {
  const data = [
    { id: "11111111-1111-1111-1111-111111111112", name: "Fiksi & Sastra" },
    {
      id: "22222222-2222-2222-2222-222222222221",
      name: "Teknologi & Komputer",
    },
    { id: "33333333-3333-3333-3333-333333333331", name: "Pengembangan Diri" },
    {
      id: "44444444-4444-4444-4444-444444444441",
      name: "Psikologi & Kesehatan",
    },
    {
      id: "55555555-5555-5555-5555-555555555551",
      name: "Filsafat & Pemikiran",
    },
    {
      id: "66666666-6666-6666-6666-666666666661",
      name: "Desain & Kreativitas",
    },
  ];
  console.log("Seeding categories...");

  await prisma.category.createMany({
    data,
    skipDuplicates: true,
  });
}
