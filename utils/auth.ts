import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function validateBasicAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");

  // check header auth
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  // split header and credentials
  const base64Credentials = authHeader.split(" ")[1];
  let credentials = "";

  try {
    credentials = Buffer.from(base64Credentials, "base64").toString("ascii");

    if (!credentials.includes(":")) {
      return false;
    }

    const separatorIndex = credentials.indexOf(":");
    const username = credentials.slice(0, separatorIndex).trim();
    const password = credentials.slice(separatorIndex + 1);

    if (!username || !password) {
      return false;
    }

    const validUsername = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

    if (username !== validUsername) {
      return false;
    }

    if (password !== validPassword) {
      return false;
    }

    return true;
  } catch {
    throw new Error("Failed to decode base64 credentials");
  }
}

export async function isAuthorizedRequest(req: NextRequest): Promise<boolean> {
  return validateBasicAuth(req);
}
