import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Start seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
        data: {
            email: "admin@local.com",
            name: "Admin Perpustakaan",
            password: hashedPassword,
        },
    });
    console.log(`Created user: ${admin.email}`);

    const catFiksi = await prisma.category.create({
        data: { name: "Fiksi & Sastra" },
    });

    const catTekno = await prisma.category.create({
        data: { name: "Teknologi & Komputer" },
    });

    const catSelfDev = await prisma.category.create({
        data: { name: "Pengembangan Diri" },
    });

    console.log("Created categories.");

    await prisma.book.createMany({
        data: [
            {
                title: "Laskar Pelangi",
                author: "Andrea Hirata",
                stock: 5,
                categoryId: catFiksi.id,
            },
            {
                title: "Bumi Manusia",
                author: "Pramoedya Ananta Toer",
                stock: 3,
                categoryId: catFiksi.id,
            },
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                stock: 10,
                categoryId: catTekno.id,
            },
            {
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt",
                stock: 8,
                categoryId: catTekno.id,
            },
            {
                title: "Refactoring UI",
                author: "Adam Wathan",
                stock: 4,
                categoryId: catTekno.id,
            },
            {
                title: "Atomic Habits",
                author: "James Clear",
                stock: 15,
                categoryId: catSelfDev.id,
            },
            {
                title: "Filosofi Teras",
                author: "Henry Manampiring",
                stock: 7,
                categoryId: catSelfDev.id,
            },
        ],
    });

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });