import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, author, categoryName, stock } = body;

        if (!title || !author || !categoryName || stock == null) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let category = await prisma.category.findFirst({
            where: { name: categoryName },
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: categoryName },
            });
        }

        const book = await prisma.book.create({
            data: {
                title,
                author,
                stock: parseInt(stock),
                categoryId: category.id,
            },
            include: { category: true },
        });

        return NextResponse.json(book, { status: 201 });
    } catch (error) {
        console.error("Error creating book:", error);
        return NextResponse.json(
            { error: "Failed to create book" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const books = await prisma.book.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const id = Number(body?.id);

        if (!id || Number.isNaN(id)) {
            return NextResponse.json(
                { error: "Missing or invalid book id" },
                { status: 400 }
            );
        }

        await prisma.book.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json(
            { error: "Failed to delete book" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, title, author, categoryName, stock } = body;

        if (!id || !title || !author || !categoryName || stock == null) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let category = await prisma.category.findFirst({
            where: { name: categoryName },
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: categoryName },
            });
        }

        const book = await prisma.book.update({
            where: { id },
            data: {
                title,
                author,
                stock: parseInt(stock),
                categoryId: category.id,
            },
            include: { category: true },
        });

        return NextResponse.json(book, { status: 201 });
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json(
            { error: "Failed to update book" },
            { status: 500 }
        );
    }
}