import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../app/generated/prisma/client";
import { seedAdminUser } from "./admin";
import { categorySeeder } from "./category";
import { bookSeeder } from "./book";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  try {
    console.log("Start seeding...");
    await seedAdminUser(prisma);
    await categorySeeder(prisma);
    await bookSeeder(prisma);
    console.log("Seeding finished.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

main();
