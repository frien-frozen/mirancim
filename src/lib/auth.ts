"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "miran-secret";

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
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Preview Mode: accept any login or mock admin/teacher accounts
  let role: Role = "ADMIN";
  let name = "Tutor Admin";

  if (username.toLowerCase().includes("teacher")) {
    role = "TEACHER";
    name = "Aziza Teacher";
  }

  const token = jwt.sign(
    { id: `usr-${username}`, name, username, role },
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
    // In UI preview mode, default to an admin session if not logged in
    return {
      id: "usr-admin",
      name: "Tutor Admin",
      username: "admin",
      role: "ADMIN" as Role,
    };
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}
