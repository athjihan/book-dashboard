import { PrismaClient } from "../../app/generated/prisma/client";

export async function bookSeeder(prisma: PrismaClient) {
  const data = [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa01",
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      stock: 5,
      categoryId: "11111111-1111-1111-1111-111111111112",
      imagePath: "/laskar-pelangi.jpg",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb02",
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      stock: 3,
      categoryId: "22222222-2222-2222-2222-222222222221",
      imagePath: "/bumi-manusia.jpg",
    },
    {
      id: "cccccccc-cccc-cccc-cccc-ccccccccccc03",
      title: "Clean Code",
      author: "Robert C. Martin",
      stock: 10,
      categoryId: "33333333-3333-3333-3333-333333333331",
      imagePath: "/clean-code.jpg",
    },
    {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd04",
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      stock: 8,
      categoryId: "22222222-2222-2222-2222-222222222221",
      imagePath: "/the-pragmatic-programmer.jpg",
    },
    {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee05",
      title: "Refactoring UI",
      author: "Adam Wathan",
      stock: 4,
      categoryId: "66666666-6666-6666-6666-666666666661",
      imagePath: "/refactoring-ui.jpg",
    },
    {
      id: "ffffffff-ffff-ffff-ffff-fffffffffff06",
      title: "Atomic Habits",
      author: "James Clear",
      stock: 15,
      categoryId: "33333333-3333-3333-3333-333333333331",
      imagePath: "/atomic-habits.jpg",
    },
    {
      id: "gggggggg-gggg-gggg-gggg-ggggggggggg07",
      title: "Filosofi Teras",
      author: "Henry Manampiring",
      stock: 7,
      categoryId: "55555555-5555-5555-5555-555555555551",
      imagePath: "/filosofi-teras.jpg",
    },
  ];

  console.log("Seeding books...");
  await prisma.book.createMany({
    data,
    skipDuplicates: true,
  });
}
