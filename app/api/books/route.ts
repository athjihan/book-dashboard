import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

function getPaginationParams(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(
        100,
        Math.max(1, Number(searchParams.get("pageSize") ?? "10") || 10)
    );

    return { page, pageSize };
}

async function getBooksForAdmin(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(       
            { 
                success: false, 
                status: 401,    
                message: "Unauthorized" 
            }, 
            { status: 401 },
        );
    }
    try {
        const { page, pageSize } = getPaginationParams(request);
        const [books, total, stockAggregate] = await Promise.all([
            prisma.book.findMany({
                where: { deletedAt: null },
                include: { category: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.book.count({
                where: { deletedAt: null },
            }),
            prisma.book.aggregate({
                where: { deletedAt: null },
                _sum: { stock: true },
            }),
        ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const totalStock = stockAggregate._sum.stock ?? 0;

    return NextResponse.json(
        {
            success: true,
            status: 200,
            message: "Books fetched successfully",
            data: books,
            meta: {
                page,
                pageSize,
                total,
                totalPages,
                totalStock,
            },
        },
        { status: 200 }
    );
    } catch (error) {
        console.error("Error fetching books for admin:", error);
        return NextResponse.json(
            { 
                success: false, 
                status: 500, 
                message: "Failed to fetch books" 
            },
            { status: 500 }
        );
    }
}

async function getBooksForNonAdmin(request: NextRequest) {
    const { page, pageSize } = getPaginationParams(request);
    const [books, total, stockAggregate] = await Promise.all([
        prisma.book.findMany({
            where: { deletedAt: null },
            include: { category: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.book.count({
            where: { deletedAt: null },
        }),
        prisma.book.aggregate({
            where: { deletedAt: null },
            _sum: { stock: true },
        }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const totalStock = stockAggregate._sum.stock ?? 0;

    return NextResponse.json(
        {
            success: true,
            status: 200,
            message: "Books fetched successfully",
            data: books,
            meta: {
                page,
                pageSize,
                total,
                totalPages,
                totalStock,
            },
        },
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { 
                success: false, 
                status: 401, 
                message: "Unauthorized" 
            }, 
            { status: 401 },
        );
    }

    try {
        const body = await request.json();
        const { title, author, categoryId, stock } = body;

        if (!title || !author || !categoryId || stock == null) {
            return NextResponse.json(
                { 
                    success: false, 
                    status: 400, 
                    message: "Missing required fields" },
                { status: 400 },
            );
        }

        let category = await prisma.category.findFirst({
            where: { id: categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { 
                    success: false, 
                    status: 400, 
                    message: "Category does not exist" 
                },
                { status: 400 }
            );
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

        return NextResponse.json(
            { 
                success: true, 
                status: 200, 
                message: "Book created successfully", 
                book 
            }, 
            { status: 200 },
        );
    } catch (error) {
        console.error("Error creating book:", error);
        return NextResponse.json(
            { 
                success: false, 
                status: 500, 
                message: "Failed to create book" 
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (session) {
            return getBooksForAdmin(request);
        }

        return getBooksForNonAdmin(request);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                status: 500,
                message: "Internal server error",
            }, 
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, status: 401, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const id = Number(body?.id);

        if (!id || Number.isNaN(id)) {
            return NextResponse.json(
                { 
                    success: false, 
                    status: 400, 
                    message: "Missing or invalid book id" 
                },
                { status: 400 }
            );
        }

        await prisma.book.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json(
            { 
                success: true, 
                status: 200, 
                message: "Book deleted successfully" 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json(
            { 
                success: false, 
                status: 500, 
                message: "Failed to delete book" 
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { 
                success: false, 
                status: 401, 
                message: "Unauthorized" 
            }, 
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { id, title, author, categoryId, stock } = body;

        if (!id || !title || !author || !categoryId || stock == null) {
            return NextResponse.json(
                { 
                    success: false, 
                    status: 400, 
                    message: "Missing required fields" 
                },
                { status: 400 }
            );
        }

        let category = await prisma.category.findFirst({
            where: { id: categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { 
                    success: false, 
                    status: 400, 
                    message: "Invalid category id" 
                },
                { status: 400 }
            );
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

        return NextResponse.json(
            { 
                success: true, 
                status: 200, 
                message: "Book updated successfully", 
                book 
            });
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json(
            { 
                success: false, 
                status: 500, 
                message: "Failed to update book" 
            },
            { status: 500 }
        );
    }
}