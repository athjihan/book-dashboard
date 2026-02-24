import path from "node:path";
import { PrismaClient } from "../../app/generated/prisma/client";

export async function imageSeeder(prisma: PrismaClient) {
  const data = [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      path: "/laskar-pelangi.jpg",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
      path: "/bumi-manusia.jpg",
    },
    {
      id: "cccccccc-cccc-cccc-cccc-ccccccccccc3",
      path: "/clean-code.jpg",
    },
    {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd4",
      path: "/pragmatic-programmer.jpg",
    },
    {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5",
      path: "/refactoring-ui.jpg",
    },
    {
      id: "ffffffff-ffff-ffff-ffff-fffffffffff6",
      path: "/atomic-habits.jpg",
    },
    {
      id: "gggggggg-gggg-gggg-gggg-ggggggggggg7",
      path: "/filosofi-teras.jpg",
    },
  ];
  console.log("Seeding images...");
  await prisma.image.createMany({
    data,
    skipDuplicates: true,
  });
}
