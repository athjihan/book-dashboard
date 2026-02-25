import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  return { page, pageSize };
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      status: 401,
      message: "Unauthorized",
    },
    { status: 401 },
  );
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedResponse();
  }

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

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
    console.error("Error fetching categories:", error);
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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: { name: categoryName },
    });

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "Category created successfully",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
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

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, categoryName } = body;

    if (!id || !categoryName) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (categoryName === existingCategory?.name) {
      return NextResponse.json(
        {
          success: true,
          status: 200,
          message: "No changes detected",
          category: existingCategory,
        },
        { status: 200 },
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: categoryName },
    });

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Category updated successfully",
        category,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating category:", error);
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
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing or invalid category id",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await tx.book.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    });

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Category deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting category:", error);
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
