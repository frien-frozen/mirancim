"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  sanitizeAndValidateUsername,
  validatePassword,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  performTimingDummyCheck,
} from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET || "miran-lms-secret-key-change-in-production";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export type LoginResult = {
  error?: string;
  code?: "INVALID_CREDS" | "DB_ERROR" | "RATE_LIMIT" | "REQUIRED_FIELDS";
  retryAfterMinutes?: number;
} | null;

export async function login(
  _prevState: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  const locale = (formData.get("locale") as string) === "tr" ? "tr" : "uz";
  const isTr = locale === "tr";

  // 1. Resolve client IP for rate limiting
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : headersList.get("x-real-ip") || "unknown";

  // 2. Check rate limit
  const rateLimitKey = `login:${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      code: "RATE_LIMIT",
      retryAfterMinutes: rateLimit.retryAfterMinutes,
      error: isTr
        ? `Çok fazla başarısız deneme yapıldı. Lütfen ${rateLimit.retryAfterMinutes} dakika sonra tekrar deneyin.`
        : `Ko'p marta xato urinishlar qilindi. Iltimos, ${rateLimit.retryAfterMinutes} daqiqadan so'ng qayta urinib ko'ring.`,
    };
  }

  // 3. Extract and sanitize inputs
  const rawUsername = formData.get("username");
  const rawPassword = formData.get("password");

  const validUsername = sanitizeAndValidateUsername(rawUsername);
  const validPassword = validatePassword(rawPassword);

  if (!validUsername.valid || !validPassword.valid) {
    recordFailedAttempt(rateLimitKey);
    return {
      code: "INVALID_CREDS",
      error: isTr
        ? "Geçersiz kullanıcı adı veya şifre"
        : "Foydalanuvchi nomi yoki parol noto'g'ri",
    };
  }

  const username = validUsername.username;
  const password = validPassword.password;

  // 4. Query user in database
  let user: {
    id: string;
    name: string;
    username: string;
    role: Role;
    password?: string;
  } | null = null;

  try {
    user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
  } catch (dbErr) {
    console.error("Database connection error during login:", dbErr);
    return {
      code: "DB_ERROR",
      error: isTr
        ? "Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin."
        : "Ma'lumotlar bazasiga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.",
    };
  }

  // 5. If user not found, perform dummy check to prevent timing attacks
  if (!user || !user.password) {
    await performTimingDummyCheck(password);
    recordFailedAttempt(rateLimitKey);
    return {
      code: "INVALID_CREDS",
      error: isTr
        ? "Geçersiz kullanıcı adı veya şifre"
        : "Foydalanuvchi nomi yoki parol noto'g'ri",
    };
  }

  // 6. Verify password with bcrypt
  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch {
    isMatch = false;
  }

  if (!isMatch) {
    recordFailedAttempt(rateLimitKey);
    return {
      code: "INVALID_CREDS",
      error: isTr
        ? "Geçersiz kullanıcı adı veya şifre"
        : "Foydalanuvchi nomi yoki parol noto'g'ri",
    };
  }

  // 7. Successful login - clear rate limit
  resetRateLimit(rateLimitKey);

  // 8. Issue cryptographic JWT token
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 9. Store secure session cookie
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
