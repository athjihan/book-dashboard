import { PrismaClient } from "../../app/generated/prisma/client";
import * as bcrypt from "bcryptjs";

export async function seedAdminUser(prisma: PrismaClient) {
  const data = [
    {
      email: "admin@local.com",
      name: "Admin Perpustakaan",
      password: await bcrypt.hash("password123", 10),
    },
    {
      email: "admin2@local.com",
      name: "Admin2 Perpustakaan",
      password: await bcrypt.hash("admin123", 10),
    },
  ];

  console.log("Seeding admin users...");

  await prisma.user.createMany({
    data,
    skipDuplicates: true,
  });
}
