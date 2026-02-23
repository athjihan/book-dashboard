import { PrismaClient } from "../../app/generated/prisma/client";

export async function bookSeeder(prisma: PrismaClient) {
  const data = [
    {
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      stock: 5,
      categoryId: 1,
    },
    {
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      stock: 3,
      categoryId: 2,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      stock: 10,
      categoryId: 3,
    },
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      stock: 8,
      categoryId: 4,
    },
    {
      title: "Refactoring UI",
      author: "Adam Wathan",
      stock: 4,
      categoryId: 5,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      stock: 15,
      categoryId: 6,
    },
    {
      title: "Filosofi Teras",
      author: "Henry Manampiring",
      stock: 7,
      categoryId: 7,
    },
  ];

  console.log("Seeding books...");
  await prisma.book.createMany({
    data,
    skipDuplicates: true,
  });
}
