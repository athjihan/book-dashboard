import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  return `${timestamp}-${random}${ext}`;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "No file provided",
        },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "File must be an image",
        },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "File size must be less than 5MB",
        },
        { status: 400 },
      );
    }

    //generate unique file name
    const fileName = generateFileName(file.name);

    // ensure public directory exists
    const publicDir = path.join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });

    // convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(publicDir, fileName);
    await writeFile(filePath, buffer);

    // return public path (relative to public folder)
    const publicPath = `/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "File uploaded successfully",
        data: {
          path: publicPath,
          name: file.name,
          storedName: fileName,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error uploading file:", error);
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
