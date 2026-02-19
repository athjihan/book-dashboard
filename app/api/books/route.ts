import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getPaginationParams(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(
        100,
        Math.max(1, Number(searchParams.get("pageSize") ?? "10") || 10)
    );

    return { page, pageSize };
}

export async function GET(request: NextRequest) {
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