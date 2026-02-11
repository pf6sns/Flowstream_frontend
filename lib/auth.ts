import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Collections } from "@/lib/db/collections";
import type { User } from "@/lib/db/models";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get user from request (from cookies or Authorization header)
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<User | null> {
  try {
    // Try to get token from cookie
    const token = request.cookies.get("auth-token")?.value;
    
    // Or from Authorization header
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const finalToken = token || bearerToken;
    if (!finalToken) return null;

    const payload = verifyToken(finalToken);
    if (!payload) return null;

    const users = await Collections.users();
    const { ObjectId } = await import("mongodb");
    
    // Convert string ID to ObjectId for query
    const userId = ObjectId.isValid(payload.userId) 
      ? new ObjectId(payload.userId) 
      : payload.userId;
    
    const user = await users.findOne({ _id: userId });

    return user as User | null;
  } catch {
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.hash(password, 10);
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.compare(password, hash);
}
