"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "miran-lms-secret-key-change-in-production";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Foydalanuvchi nomi va parol kiritilishi shart" };
  }

  // Look up user in Prisma database
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    return { error: "Foydalanuvchi nomi yoki parol noto'g'ri" };
  }

  // Verify bcrypt hashed password (or plain-text match if unhashed)
  const isMatch =
    (await bcrypt.compare(password, user.password).catch(() => false)) ||
    user.password === password;

  if (!isMatch) {
    return { error: "Foydalanuvchi nomi yoki parol noto'g'ri" };
  }

  // If password was stored in plain text, auto-upgrade to bcrypt hash
  if (user.password === password && !password.startsWith("$2")) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

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
