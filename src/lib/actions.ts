"use server";

import { requireAuth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ========================
// GROUP ACTIONS
// ========================

export async function getGroups() {
  await requireAuth();
  const groups = await prisma.group.findMany({
    include: {
      schedules: {
        orderBy: { dayOfWeek: "asc" },
      },
      _count: {
        select: {
          students: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return groups;
}

export async function createGroup(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Guruh nomi kiritilishi shart" };

  const rawSchedules = (formData.get("schedules") as string) || "[]";
  let schedules: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  try {
    schedules = JSON.parse(rawSchedules);
  } catch {
    schedules = [];
  }

  await prisma.group.create({
    data: {
      name,
      schedules: {
        create: schedules.map((s) => ({
          dayOfWeek: Number(s.dayOfWeek),
          startTime: s.startTime || "14:00",
          endTime: s.endTime || "16:00",
        })),
      },
    },
  });

  revalidatePath("/groups");
  revalidatePath("/attendance");
  revalidatePath("/students");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGroup(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Guruh nomi kiritilishi shart" };

  const rawSchedules = (formData.get("schedules") as string) || "[]";
  let schedules: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  try {
    schedules = JSON.parse(rawSchedules);
  } catch {
    schedules = [];
  }

  await prisma.$transaction([
    prisma.group.update({
      where: { id },
      data: { name },
    }),
    prisma.groupSchedule.deleteMany({
      where: { groupId: id },
    }),
    ...(schedules.length > 0
      ? [
          prisma.groupSchedule.createMany({
            data: schedules.map((s) => ({
              groupId: id,
              dayOfWeek: Number(s.dayOfWeek),
              startTime: s.startTime || "14:00",
              endTime: s.endTime || "16:00",
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/groups");
  revalidatePath("/attendance");
  revalidatePath("/students");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGroup(id: string) {
  await requireAdmin();
  await prisma.group.delete({
    where: { id },
  });

  revalidatePath("/groups");
  revalidatePath("/attendance");
  revalidatePath("/students");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

// ========================
// STUDENT ACTIONS
// ========================

export async function getStudents(groupId?: string) {
  await requireAuth();
  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      ...(groupId && groupId !== "all" ? { groupId } : {}),
    },
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return students;
}

export async function getStudent(id: string) {
  await requireAuth();
  return prisma.student.findUnique({
    where: { id },
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function createStudent(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim() || null;
  const rawTelegram = (formData.get("telegram") as string)?.trim() || null;
  const telegram = rawTelegram
    ? rawTelegram.startsWith("@")
      ? rawTelegram
      : `@${rawTelegram}`
    : null;
  const tuitionFee = parseInt(formData.get("tuitionFee") as string) || 450000;
  const groupId = formData.get("groupId") as string;

  if (!name || !groupId) {
    return { error: "Ism va guruh tanlanishi shart" };
  }

  await prisma.student.create({
    data: {
      name,
      phone: phone || "+998 -- --- -- --",
      parentPhone,
      telegram,
      tuitionFee,
      groupId,
      isActive: true,
    },
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/payments");
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim() || null;
  const rawTelegram = (formData.get("telegram") as string)?.trim() || null;
  const telegram = rawTelegram
    ? rawTelegram.startsWith("@")
      ? rawTelegram
      : `@${rawTelegram}`
    : null;
  const tuitionFee = parseInt(formData.get("tuitionFee") as string) || 450000;
  const groupId = formData.get("groupId") as string;

  if (!name || !groupId) {
    return { error: "Ism va guruh tanlanishi shart" };
  }

  await prisma.student.update({
    where: { id },
    data: {
      name,
      phone: phone || "+998 -- --- -- --",
      parentPhone,
      telegram,
      tuitionFee,
      groupId,
    },
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/payments");
  return { success: true };
}

export async function deleteStudent(id: string) {
  await requireAdmin();
  await prisma.student.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/payments");
  return { success: true };
}

// ========================
// ATTENDANCE ACTIONS
// ========================

export async function getAttendance(groupId: string, dateStr: string) {
  await requireAuth();
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

  const students = await prisma.student.findMany({
    where: {
      groupId,
      isActive: true,
    },
    include: {
      attendances: {
        where: {
          date: targetDate,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return students.map((student) => ({
    id: student.id,
    name: student.name,
    phone: student.phone,
    telegram: student.telegram,
    attendance:
      student.attendances.length > 0
        ? {
            id: student.attendances[0].id,
            isPresent: student.attendances[0].isPresent,
          }
        : null,
  }));
}

export async function markAttendance(
  studentId: string,
  dateStr: string,
  isPresent: boolean
) {
  await requireAuth();
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

  await prisma.attendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date: targetDate,
      },
    },
    update: { isPresent },
    create: {
      studentId,
      date: targetDate,
      isPresent,
    },
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function markAllAttendance(
  studentIds: string[],
  dateStr: string,
  isPresent: boolean
) {
  await requireAuth();
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

  await prisma.$transaction(
    studentIds.map((studentId) =>
      prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: targetDate,
          },
        },
        update: { isPresent },
        create: {
          studentId,
          date: targetDate,
          isPresent,
        },
      })
    )
  );

  revalidatePath("/attendance");
  return { success: true };
}

// ========================
// PAYMENT ACTIONS
// ========================

export async function getPayments(month?: string) {
  await requireAdmin();
  const targetMonth = month
    ? month.substring(0, 7)
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const monthDate = new Date(`${targetMonth}-01T00:00:00.000Z`);

  const students = await prisma.student.findMany({
    where: { isActive: true },
    include: {
      group: {
        select: { id: true, name: true },
      },
      payments: {
        where: {
          month: monthDate,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return students.map((student) => {
    const payment = student.payments[0];
    return {
      id: student.id,
      name: student.name,
      phone: student.phone,
      tuitionFee: student.tuitionFee,
      group: student.group,
      payment: payment
        ? {
            id: payment.id,
            isPaid: payment.isPaid,
            amount: payment.amount,
            paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
          }
        : null,
    };
  });
}

export async function confirmPayment(studentId: string, monthStr?: string) {
  await requireAdmin();
  const targetMonth = monthStr
    ? monthStr.substring(0, 7)
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const monthDate = new Date(`${targetMonth}-01T00:00:00.000Z`);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) return { error: "O'quvchi topilmadi" };

  await prisma.payment.upsert({
    where: {
      studentId_month: {
        studentId,
        month: monthDate,
      },
    },
    update: {
      isPaid: true,
      amount: student.tuitionFee,
      paidAt: new Date(),
    },
    create: {
      studentId,
      month: monthDate,
      amount: student.tuitionFee,
      isPaid: true,
      paidAt: new Date(),
    },
  });

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unconfirmPayment(studentId: string, monthStr?: string) {
  await requireAdmin();
  const targetMonth = monthStr
    ? monthStr.substring(0, 7)
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const monthDate = new Date(`${targetMonth}-01T00:00:00.000Z`);

  await prisma.payment.deleteMany({
    where: {
      studentId,
      month: monthDate,
    },
  });

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

// ========================
// DASHBOARD STATS
// ========================

export async function getDashboardStats() {
  await requireAuth();

  const now = new Date();
  const targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthDate = new Date(`${targetMonth}-01T00:00:00.000Z`);

  const [activeStudents, totalGroups, currentMonthPayments] = await Promise.all([
    prisma.student.findMany({
      where: { isActive: true },
      select: { tuitionFee: true },
    }),
    prisma.group.count(),
    prisma.payment.findMany({
      where: {
        month: monthDate,
        isPaid: true,
      },
      select: { amount: true },
    }),
  ]);

  const totalStudents = activeStudents.length;
  const expectedRevenue = activeStudents.reduce((sum, s) => sum + s.tuitionFee, 0);
  const collectedRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidCount = currentMonthPayments.length;
  const unpaidCount = Math.max(0, totalStudents - paidCount);

  return {
    totalStudents,
    totalGroups,
    expectedRevenue,
    collectedRevenue,
    paidCount,
    unpaidCount,
  };
}

// ========================
// PROFILE / SETTINGS ACTIONS
// ========================

export async function updateProfile(formData: FormData) {
  const session = await requireAuth();
  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (!name || !username) {
    return { error: "Ism va foydalanuvchi nomi to'ldirilishi shart" };
  }

  // Find user in Prisma database
  let user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        username: {
          equals: session.username,
          mode: "insensitive",
        },
      },
    });
  }

  if (!user) {
    return { error: "Foydalanuvchi topilmadi" };
  }

  // Check if username changed and is already taken
  if (username !== user.username.toLowerCase()) {
    const existing = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
        NOT: { id: user.id },
      },
    });
    if (existing) {
      return { error: "Ushbu foydalanuvchi nomi allaqachon band" };
    }
  }

  let updatedPassword = user.password;

  // Check if changing password
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      return { error: "Hozirgi parolni kiriting" };
    }

    const isCurrentValid =
      (await bcrypt.compare(currentPassword, user.password).catch(() => false)) ||
      user.password === currentPassword;

    if (!isCurrentValid) {
      return { error: "Hozirgi parol noto'g'ri" };
    }
    if (!newPassword || newPassword.length < 4) {
      return { error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak" };
    }
    if (newPassword !== confirmPassword) {
      return { error: "Yangi parollar bir-biriga mos kelmadi" };
    }

    updatedPassword = await bcrypt.hash(newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      username,
      password: updatedPassword,
    },
  });

  // Re-sign JWT session cookie with updated credentials
  const JWT_SECRET = process.env.JWT_SECRET || "miran-lms-secret-key-change-in-production";
  const token = jwt.sign(
    {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      role: updatedUser.role,
    },
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

  revalidatePath("/", "layout");
  return { success: true, name: updatedUser.name, username: updatedUser.username };
}
