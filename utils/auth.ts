import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function validateBasicAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");

  // check header auth
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  // split header and credentials
  const base64Credentials = authHeader.split(" ")[1];
  let credentials = "";

  try {
    credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  } catch {
    throw new Error("Failed to decode base64 credentials");
  }

  if (!credentials.includes(":")) {
    throw new Error("Invalid credentials format");
  }

  const separatorIndex = credentials.indexOf(":");
  const username = credentials.slice(0, separatorIndex).trim();
  const password = credentials.slice(separatorIndex + 1);

  if (!username || !password) {
    throw new Error("Missing username or password");
  }

  const user = await prisma.user.findFirst({
    where: {
      email: username,
      deletedAt: null,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return bcrypt.compare(password, user.password);
}

export async function isAuthorizedRequest(
  req: NextRequest,
  session: unknown,
): Promise<boolean> {
  if (Boolean(session)) {
    return true;
  }

  return validateBasicAuth(req);
}
