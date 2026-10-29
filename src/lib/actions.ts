"use server";

import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  mockGroups,
  mockStudents,
  mockAttendances,
  mockPayments,
  MockStudent,
} from "./mock-data";

// ========================
// GROUP ACTIONS
// ========================

export async function getGroups() {
  await requireAuth();
  return mockGroups.map((g) => ({
    ...g,
    _count: {
      students: mockStudents.filter((s) => s.groupId === g.id && s.isActive).length,
    },
  }));
}

export async function createGroup(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Group name is required" };

  const rawSchedules = (formData.get("schedules") as string) || "[]";
  let schedules = [];
  try {
    schedules = JSON.parse(rawSchedules);
  } catch {
    schedules = [];
  }

  const newGroup = {
    id: `grp-${Date.now()}`,
    name: name.trim(),
    schedules,
    createdAt: new Date(),
    _count: { students: 0 },
  };
  mockGroups.unshift(newGroup);

  revalidatePath("/groups");
  return { success: true };
}

export async function updateGroup(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Group name is required" };

  const rawSchedules = (formData.get("schedules") as string) || "[]";
  let schedules = [];
  try {
    schedules = JSON.parse(rawSchedules);
  } catch {
    schedules = [];
  }

  const group = mockGroups.find((g) => g.id === id);
  if (group) {
    group.name = name.trim();
    group.schedules = schedules;
  }

  revalidatePath("/groups");
  return { success: true };
}

export async function deleteGroup(id: string) {
  await requireAdmin();
  const index = mockGroups.findIndex((g) => g.id === id);
  if (index !== -1) mockGroups.splice(index, 1);

  revalidatePath("/groups");
  return { success: true };
}

// ========================
// STUDENT ACTIONS
// ========================

export async function getStudents(groupId?: string) {
  await requireAuth();
  let list = mockStudents.filter((s) => s.isActive);
  if (groupId && groupId !== "all") {
    list = list.filter((s) => s.groupId === groupId);
  }
  return list;
}

export async function getStudent(id: string) {
  await requireAuth();
  return mockStudents.find((s) => s.id === id) || null;
}

export async function createStudent(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const parentPhone = (formData.get("parentPhone") as string) || null;
  const rawTelegram = (formData.get("telegram") as string) || null;
  const telegram = rawTelegram?.trim()
    ? rawTelegram.trim().startsWith("@")
      ? rawTelegram.trim()
      : `@${rawTelegram.trim()}`
    : null;
  const tuitionFee = parseInt(formData.get("tuitionFee") as string);
  const groupId = formData.get("groupId") as string;

  if (!name?.trim() || !phone?.trim() || !groupId || isNaN(tuitionFee)) {
    return { error: "All required fields must be filled" };
  }

  const group = mockGroups.find((g) => g.id === groupId);
  const newStudent: MockStudent = {
    id: `std-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    parentPhone: parentPhone?.trim() || null,
    telegram,
    tuitionFee,
    isActive: true,
    groupId,
    createdAt: new Date(),
    group: { id: groupId, name: group?.name || "Unknown Group" },
  };

  mockStudents.unshift(newStudent);

  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const parentPhone = (formData.get("parentPhone") as string) || null;
  const rawTelegram = (formData.get("telegram") as string) || null;
  const telegram = rawTelegram?.trim()
    ? rawTelegram.trim().startsWith("@")
      ? rawTelegram.trim()
      : `@${rawTelegram.trim()}`
    : null;
  const tuitionFee = parseInt(formData.get("tuitionFee") as string);
  const groupId = formData.get("groupId") as string;

  if (!name?.trim() || !phone?.trim() || !groupId || isNaN(tuitionFee)) {
    return { error: "All required fields must be filled" };
  }

  const student = mockStudents.find((s) => s.id === id);
  const group = mockGroups.find((g) => g.id === groupId);

  if (student) {
    student.name = name.trim();
    student.phone = phone.trim();
    student.parentPhone = parentPhone?.trim() || null;
    student.telegram = telegram;
    student.tuitionFee = tuitionFee;
    student.groupId = groupId;
    if (group) student.group = { id: group.id, name: group.name };
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStudent(id: string) {
  await requireAdmin();
  const index = mockStudents.findIndex((s) => s.id === id);
  if (index !== -1) mockStudents.splice(index, 1);

  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { success: true };
}

// ========================
// ATTENDANCE ACTIONS
// ========================

export async function getAttendance(groupId: string, date: string) {
  await requireAuth();
  const studentsInGroup = mockStudents.filter(
    (s) => s.groupId === groupId && s.isActive
  );

  return studentsInGroup.map((student) => {
    const record = mockAttendances.find(
      (a) => a.studentId === student.id && a.date === date
    );
    return {
      ...student,
      attendance: record ? { id: record.id, isPresent: record.isPresent } : null,
    };
  });
}

export async function markAttendance(
  studentId: string,
  date: string,
  isPresent: boolean
) {
  await requireAuth();
  const existing = mockAttendances.find(
    (a) => a.studentId === studentId && a.date === date
  );

  if (existing) {
    existing.isPresent = isPresent;
  } else {
    mockAttendances.push({
      id: `att-${Date.now()}`,
      studentId,
      date,
      isPresent,
    });
  }

  revalidatePath("/attendance");
  return { success: true };
}

export async function markAllAttendance(
  studentIds: string[],
  date: string,
  isPresent: boolean
) {
  await requireAuth();
  for (const studentId of studentIds) {
    const existing = mockAttendances.find(
      (a) => a.studentId === studentId && a.date === date
    );
    if (existing) {
      existing.isPresent = isPresent;
    } else {
      mockAttendances.push({
        id: `att-${Date.now()}-${studentId}`,
        studentId,
        date,
        isPresent,
      });
    }
  }

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

  const activeStudents = mockStudents.filter((s) => s.isActive);

  return activeStudents.map((student) => {
    const payment = mockPayments.find(
      (p) => p.studentId === student.id && p.month === targetMonth
    );
    return {
      ...student,
      payment: payment
        ? {
            id: payment.id,
            isPaid: payment.isPaid,
            amount: payment.amount,
            paidAt: payment.paidAt?.toISOString() || null,
          }
        : null,
    };
  });
}

export async function confirmPayment(studentId: string, month?: string) {
  await requireAdmin();
  const targetMonth = month
    ? month.substring(0, 7)
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const student = mockStudents.find((s) => s.id === studentId);
  if (!student) return { error: "Student not found" };

  const existing = mockPayments.find(
    (p) => p.studentId === studentId && p.month === targetMonth
  );

  if (existing) {
    existing.isPaid = true;
    existing.paidAt = new Date();
  } else {
    mockPayments.push({
      id: `pay-${Date.now()}`,
      studentId,
      month: targetMonth,
      amount: student.tuitionFee,
      isPaid: true,
      paidAt: new Date(),
    });
  }

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unconfirmPayment(studentId: string, month?: string) {
  await requireAdmin();
  const targetMonth = month
    ? month.substring(0, 7)
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const index = mockPayments.findIndex(
    (p) => p.studentId === studentId && p.month === targetMonth
  );
  if (index !== -1) {
    mockPayments.splice(index, 1);
  }

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

// ========================
// DASHBOARD STATS
// ========================

export async function getDashboardStats() {
  await requireAuth();

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const activeStudents = mockStudents.filter((s) => s.isActive);

  const totalStudents = activeStudents.length;
  const totalGroups = mockGroups.length;

  const expectedRevenue = activeStudents.reduce((sum, s) => sum + s.tuitionFee, 0);

  const currentMonthPayments = mockPayments.filter(
    (p) => p.month === currentMonth && p.isPaid
  );
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
