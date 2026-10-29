import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with Turkish course data...");

  // Create Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Tutor Admin",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create Teacher user
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  await prisma.user.upsert({
    where: { username: "teacher" },
    update: {},
    create: {
      name: "Türkçe Öğretmeni",
      username: "teacher",
      password: teacherPassword,
      role: "TEACHER",
    },
  });

  // Create Turkish Language Groups
  const group1 = await prisma.group.create({
    data: { name: "Türkçe A1 - Başlangıç (Ertalab)" },
  });

  const group2 = await prisma.group.create({
    data: { name: "TÖMER B1-B2 - Intensive (Kechki)" },
  });

  const group3 = await prisma.group.create({
    data: { name: "Türkçe Konuşma Kulübü (Dam olish)" },
  });

  // Create sample students
  const students = [
    { name: "Azizbek Karimov", phone: "+998 90 123 45 67", parentPhone: "+998 90 987 65 43", tuitionFee: 450000, groupId: group1.id },
    { name: "Dilnoza Rahimova", phone: "+998 93 234 56 78", parentPhone: "+998 91 345 67 89", tuitionFee: 450000, groupId: group1.id },
    { name: "Bobur Toshmatov", phone: "+998 97 345 67 89", parentPhone: null, tuitionFee: 450000, groupId: group1.id },
    { name: "Madina Yusupova", phone: "+998 94 456 78 90", parentPhone: "+998 90 111 22 33", tuitionFee: 450000, groupId: group1.id },
    { name: "Sardor Aliyev", phone: "+998 99 567 89 01", parentPhone: "+998 93 444 55 66", tuitionFee: 480000, groupId: group2.id },
    { name: "Nilufar Xasanova", phone: "+998 90 678 90 12", parentPhone: null, tuitionFee: 480000, groupId: group2.id },
    { name: "Jasur Mirzayev", phone: "+998 91 789 01 23", parentPhone: "+998 97 888 99 00", tuitionFee: 480000, groupId: group2.id },
    { name: "Zulfiya Karimova", phone: "+998 98 890 12 34", parentPhone: "+998 99 000 11 22", tuitionFee: 400000, groupId: group3.id },
    { name: "Farrux Xolmatov", phone: "+998 93 901 23 45", parentPhone: null, tuitionFee: 400000, groupId: group3.id },
  ];

  for (const student of students) {
    await prisma.student.create({ data: student });
  }

  console.log("✅ Seeded successfully with Turkish Language Tutor data!");
  console.log("   Admin: admin / admin123");
  console.log("   Teacher: teacher / teacher123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
