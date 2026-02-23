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
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              books: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.count({
        where: { deletedAt: null },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Categories fetched successfully",
      data: categories,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
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
