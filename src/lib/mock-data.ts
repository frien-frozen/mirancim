import { Role } from "@prisma/client";

export interface MockUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
}

export const mockUsers: MockUser[] = [
  {
    id: "usr-admin",
    name: "Tutor Admin",
    username: "admin",
    password: "admin123",
    role: "ADMIN",
  },
  {
    id: "usr-teacher",
    name: "Aziza Teacher",
    username: "teacher",
    password: "teacher123",
    role: "TEACHER",
  },
];

export interface GroupSchedule {
  id: string;
  dayOfWeek: number; // 0: Everyday, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat, 7: Sun
  startTime: string; // e.g. "14:00"
  endTime: string;   // e.g. "16:00"
}

export interface MockGroup {
  id: string;
  name: string;
  schedules?: GroupSchedule[];
  createdAt: Date;
  _count: { students: number };
}

export interface MockStudent {
  id: string;
  name: string;
  phone: string;
  parentPhone: string | null;
  telegram?: string | null;
  tuitionFee: number;
  isActive: boolean;
  groupId: string;
  createdAt: Date;
  group: { id: string; name: string };
}

export interface MockAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  isPresent: boolean;
}

export interface MockPaymentRecord {
  id: string;
  month: string; // YYYY-MM
  studentId: string;
  amount: number;
  isPaid: boolean;
  paidAt: Date | null;
}

// Turkish Language Tutor Groups (A1, B1-B2 TÖMER, Konuşma Kulübü) with lesson times
export const mockGroups: MockGroup[] = [
  {
    id: "grp-1",
    name: "Türkçe A1 - Başlangıç (Ertalab)",
    schedules: [
      { id: "sch-1", dayOfWeek: 2, startTime: "10:00", endTime: "11:30" }, // Seshanba / Salı
      { id: "sch-2", dayOfWeek: 4, startTime: "10:00", endTime: "11:30" }, // Payshanba / Perşembe
    ],
    createdAt: new Date(),
    _count: { students: 4 },
  },
  {
    id: "grp-2",
    name: "TÖMER B1-B2 - Intensive (Kechki)",
    schedules: [
      { id: "sch-3", dayOfWeek: 1, startTime: "18:30", endTime: "20:30" }, // Dushanba / Pazartesi
      { id: "sch-4", dayOfWeek: 3, startTime: "18:30", endTime: "20:30" }, // Chorshanba / Çarşamba
      { id: "sch-5", dayOfWeek: 5, startTime: "18:30", endTime: "20:30" }, // Juma / Cuma
    ],
    createdAt: new Date(),
    _count: { students: 3 },
  },
  {
    id: "grp-3",
    name: "Türkçe Konuşma Kulübü (Dam olish)",
    schedules: [
      { id: "sch-6", dayOfWeek: 6, startTime: "14:00", endTime: "16:00" }, // Shanba / Cumartesi
      { id: "sch-7", dayOfWeek: 7, startTime: "14:00", endTime: "16:00" }, // Yakshanba / Pazar
    ],
    createdAt: new Date(),
    _count: { students: 2 },
  },
];

export const mockStudents: MockStudent[] = [
  {
    id: "std-1",
    name: "Azizbek Karimov",
    phone: "+998 90 123 45 67",
    parentPhone: "+998 90 987 65 43",
    telegram: "@azizbek_k",
    tuitionFee: 450000,
    isActive: true,
    groupId: "grp-1",
    createdAt: new Date(),
    group: { id: "grp-1", name: "Türkçe A1 - Başlangıç (Ertalab)" },
  },
  {
    id: "std-2",
    name: "Dilnoza Rahimova",
    phone: "+998 93 234 56 78",
    parentPhone: "+998 91 345 67 89",
    telegram: "@dilnoza_r",
    tuitionFee: 450000,
    isActive: true,
    groupId: "grp-1",
    createdAt: new Date(),
    group: { id: "grp-1", name: "Türkçe A1 - Başlangıç (Ertalab)" },
  },
  {
    id: "std-3",
    name: "Bobur Toshmatov",
    phone: "+998 97 345 67 89",
    parentPhone: null,
    telegram: "@bobur_t",
    tuitionFee: 450000,
    isActive: true,
    groupId: "grp-1",
    createdAt: new Date(),
    group: { id: "grp-1", name: "Türkçe A1 - Başlangıç (Ertalab)" },
  },
  {
    id: "std-4",
    name: "Madina Yusupova",
    phone: "+998 94 456 78 90",
    parentPhone: "+998 90 111 22 33",
    telegram: "@madina_y",
    tuitionFee: 450000,
    isActive: true,
    groupId: "grp-1",
    createdAt: new Date(),
    group: { id: "grp-1", name: "Türkçe A1 - Başlangıç (Ertalab)" },
  },
  {
    id: "std-5",
    name: "Sardor Aliyev",
    phone: "+998 99 567 89 01",
    parentPhone: "+998 93 444 55 66",
    tuitionFee: 480000,
    isActive: true,
    groupId: "grp-2",
    createdAt: new Date(),
    group: { id: "grp-2", name: "TÖMER B1-B2 - Intensive (Kechki)" },
  },
  {
    id: "std-6",
    name: "Nilufar Xasanova",
    phone: "+998 90 678 90 12",
    parentPhone: null,
    tuitionFee: 480000,
    isActive: true,
    groupId: "grp-2",
    createdAt: new Date(),
    group: { id: "grp-2", name: "TÖMER B1-B2 - Intensive (Kechki)" },
  },
  {
    id: "std-7",
    name: "Jasur Mirzayev",
    phone: "+998 91 789 01 23",
    parentPhone: "+998 97 888 99 00",
    tuitionFee: 480000,
    isActive: true,
    groupId: "grp-2",
    createdAt: new Date(),
    group: { id: "grp-2", name: "TÖMER B1-B2 - Intensive (Kechki)" },
  },
  {
    id: "std-8",
    name: "Zulfiya Karimova",
    phone: "+998 98 890 12 34",
    parentPhone: "+998 99 000 11 22",
    tuitionFee: 400000,
    isActive: true,
    groupId: "grp-3",
    createdAt: new Date(),
    group: { id: "grp-3", name: "Türkçe Konuşma Kulübü (Dam olish)" },
  },
  {
    id: "std-9",
    name: "Farrux Xolmatov",
    phone: "+998 93 901 23 45",
    parentPhone: null,
    tuitionFee: 400000,
    isActive: true,
    groupId: "grp-3",
    createdAt: new Date(),
    group: { id: "grp-3", name: "Türkçe Konuşma Kulübü (Dam olish)" },
  },
];

const today = new Date().toISOString().split("T")[0];

export const mockAttendances: MockAttendanceRecord[] = [
  { id: "att-1", date: today, studentId: "std-1", isPresent: true },
  { id: "att-2", date: today, studentId: "std-2", isPresent: true },
  { id: "att-3", date: today, studentId: "std-3", isPresent: false },
  { id: "att-4", date: today, studentId: "std-4", isPresent: true },
  { id: "att-5", date: today, studentId: "std-5", isPresent: true },
  { id: "att-6", date: today, studentId: "std-6", isPresent: false },
];

const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

export const mockPayments: MockPaymentRecord[] = [
  { id: "pay-1", month: currentMonth, studentId: "std-1", amount: 450000, isPaid: true, paidAt: new Date() },
  { id: "pay-2", month: currentMonth, studentId: "std-2", amount: 450000, isPaid: true, paidAt: new Date() },
  { id: "pay-3", month: currentMonth, studentId: "std-5", amount: 480000, isPaid: true, paidAt: new Date() },
  { id: "pay-4", month: currentMonth, studentId: "std-8", amount: 400000, isPaid: true, paidAt: new Date() },
];
