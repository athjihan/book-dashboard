import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const stock = Number(formData.get("stock"));
    const image = formData.get("image") as File;

    if (!title || !author || !categoryId || Number.isNaN(stock) || !image) {
      return NextResponse.json(
        { success: false, status: 400, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, status: 404, message: "Category not found" },
        { status: 404 },
      );
    }

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, status: 400, message: "Invalid image type" },
        { status: 400 },
      );
    }

    const fileName = generateFileName(image.name);

    const uploadDir = path.join(process.cwd(), "public");
    const filePath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });

    const bytes = await image.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imagePath = `/${fileName}`;

    const book = await prisma.book.create({
      data: { title, author, stock, categoryId: category.id, imagePath },
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
    return NextResponse.json(
      { success: false, status: 500, message: "Internal server error" },
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
    const formData = await request.formData();

    const id = String(formData.get("id") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const stock = Number(formData.get("stock"));
    const imageEntry = formData.get("image");

    // image TIDAK wajib saat update
    if (!id || !title || !author || !categoryId || Number.isNaN(stock)) {
      return NextResponse.json(
        { success: false, status: 400, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingBook = await prisma.book.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingBook) {
      return NextResponse.json(
        { success: false, status: 404, message: "Book not found" },
        { status: 404 },
      );
    }

    const dataToUpdate: {
      title?: string;
      author?: string;
      categoryId?: string;
      stock?: number;
      imagePath?: string;
    } = {};

    if (existingBook.title !== title) dataToUpdate.title = title;
    if (existingBook.author !== author) dataToUpdate.author = author;
    if (existingBook.stock !== stock) dataToUpdate.stock = stock;

    if (existingBook.categoryId !== categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, deletedAt: null },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, status: 404, message: "Category not found" },
          { status: 404 },
        );
      }

      dataToUpdate.categoryId = categoryId;
    }

    const hasNewImage = imageEntry instanceof File && imageEntry.size > 0;

    if (hasNewImage) {
      if (!imageEntry.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, status: 400, message: "Invalid image type" },
          { status: 400 },
        );
      }

      const fileName = generateFileName(imageEntry.name);
      const uploadDir = path.join(process.cwd(), "public");
      const filePath = path.join(uploadDir, fileName);

      await mkdir(uploadDir, { recursive: true });
      const bytes = await imageEntry.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      dataToUpdate.imagePath = `/${fileName}`;
    }

    if (Object.keys(dataToUpdate).length === 0) {
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

    const updatedBook = await prisma.book.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    // hpus image lama hanya jika user upload image baru
    if (
      hasNewImage &&
      existingBook.imagePath &&
      dataToUpdate.imagePath &&
      dataToUpdate.imagePath !== existingBook.imagePath
    ) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        existingBook.imagePath.replace(/^\/+/, ""),
      );
      await unlink(oldImagePath);
    }

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Book updated successfully",
        book: updatedBook,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { success: false, status: 500, message: "Internal server error" },
      { status: 500 },
    );
  }
}

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const random = Math.random().toString(36).substring(2, 8);
  const nameWithoutExt = path.basename(originalName, ext);

  const safeName = nameWithoutExt
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "-");

  return `${safeName}-${random}${ext}`;
}
