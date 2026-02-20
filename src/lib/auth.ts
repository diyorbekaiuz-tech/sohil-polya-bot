import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Hash password for comparison
let hashedPassword: string | null = null;

async function getHashedPassword(): Promise<string> {
  if (!hashedPassword) {
    hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  }
  return hashedPassword;
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<string | null> {
  if (username !== ADMIN_USERNAME) return null;

  // For simplicity, compare directly (in production use hashed passwords from DB)
  if (password !== ADMIN_PASSWORD) return null;

  const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, {
    expiresIn: "24h",
  });

  return token;
}

export function verifyToken(token: string): { username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; role: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  // Also check cookies
  const cookieToken = req.cookies.get("admin_token")?.value;
  return cookieToken || null;
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { error: "Avtorizatsiya talab qilinadi" },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json(
      { error: "Ruxsat yo'q" },
      { status: 403 }
    );
  }

  return null; // Auth passed
}
