import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getPaginationParams(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "10");

    return { page, pageSize };
}

export async function GET(request: NextRequest) {
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

        const totalPages = Math.ceil(total / pageSize);
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
        return NextResponse.json(
            {
                success: false,
                status: 500,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
    
}