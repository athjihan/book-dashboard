import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { unlink } from "fs/promises";
import path from "path";

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
    const [books, total, stockAggregate] = await Promise.all([
      prisma.book.findMany({
        where: { deletedAt: null },
        include: {
          category: true,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
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
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching books for admin:", error);
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
    const { title, author, categoryId, imagePath, stock } = body;

    if (!title || !author || !categoryId || !imagePath || stock == null) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    let category = await prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          status: 404,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        stock: parseInt(stock),
        categoryId: category.id,
        imagePath,
      },
      include: { category: true },
    });

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "Book created successfully",
        book,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating book:", error);
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
          message: "Missing or invalid book id",
        },
        { status: 400 },
      );
    }

    const existingBook = await prisma.book.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          status: 404,
          message: "Book not found",
        },
        { status: 404 },
      );
    }

    await prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const imagePath = path.join(
      process.cwd(),
      "public",
      existingBook.imagePath,
    );

    await unlink(imagePath);

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Book deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting book:", error);
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
    const { id, title, author, categoryId, stock, imagePath } = body;

    if (
      !id ||
      !title ||
      !author ||
      !categoryId ||
      !imagePath ||
      stock == null
    ) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    let category = await prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          status: 404,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const existingBook = await prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });

    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          status: 404,
          message: "Book not found",
        },
        { status: 404 },
      );
    }

    if (
      title === existingBook.title &&
      author === existingBook.author &&
      categoryId === existingBook.categoryId &&
      stock === existingBook.stock &&
      imagePath === existingBook.imagePath
    ) {
      return NextResponse.json(
        {
          success: true,
          status: 200,
          message: "No changes detected",
          book: existingBook,
        },
        { status: 200 },
      );
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        stock,
        categoryId: category.id,
        imagePath,
      },
      include: {
        category: true,
      },
    });

    if (imagePath !== existingBook.imagePath) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        existingBook.imagePath,
      );
      await unlink(oldImagePath);
    }

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Book updated successfully",
        book,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating book:", error);
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
