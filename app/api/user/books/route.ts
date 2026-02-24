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
          image: true,
        },
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
    const { title, author, categoryId, imagePath, imageName, stock } = body;

    if (!title || !author || !categoryId || stock == null) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "Missing required fields: title, author, categoryId, stock",
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

    // If imagePath provided, create Image record first
    let imageId: string | null = null;
    if (imagePath) {
      const image = await prisma.image.create({
        data: { path: imagePath, name: imageName },
      });
      imageId = image.id;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        stock: parseInt(stock),
        categoryId: category.id,
        imageId: imageId,
      },
      include: { category: true, image: true },
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
      include: { image: true },
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

    if (existingBook.imageId) {
      await prisma.image.update({
        where: { id: existingBook.imageId },
        data: { deletedAt: new Date() },
      });

      if (existingBook.image?.path) {
        const publicFilePath = path.join(
          process.cwd(),
          "public",
          existingBook.image.path.replace(/^\//, ""),
        );
        try {
          await unlink(publicFilePath);
        } catch {
          // ignore file delete errors (file may not exist)
        }
      }
    }

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
    const { id, title, author, categoryId, stock, imagePath, imageName } = body;

    if (!id || !title || !author || !categoryId || stock == null) {
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
      include: { image: true },
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

    let nextImageId: string | null = existingBook.imageId;

    if (imagePath) {
      const newImage = await prisma.image.create({
        data: { path: imagePath, name: imageName || null },
      });
      nextImageId = newImage.id;

      if (existingBook.image?.id) {
        await prisma.image.update({
          where: { id: existingBook.image.id },
          data: { deletedAt: new Date() },
        });

        if (existingBook.image.path) {
          const publicFilePath = path.join(
            process.cwd(),
            "public",
            existingBook.image.path.replace(/^\//, ""),
          );
          try {
            await unlink(publicFilePath);
          } catch {
            // ignore file delete errors (file may not exist)
          }
        }
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        stock: parseInt(stock),
        categoryId: category.id,
        imageId: nextImageId,
      },
      include: {
        category: true,
        image: true,
      },
    });

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
