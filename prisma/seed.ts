import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Syncing Prisma database with real groups and students...");

  // 1. Ensure Admin & Teacher users
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: adminPassword,
      name: "Tutor Admin",
      role: "ADMIN",
    },
    create: {
      name: "Tutor Admin",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const teacherPassword = await bcrypt.hash("teacher123", 10);
  await prisma.user.upsert({
    where: { username: "teacher" },
    update: {
      password: teacherPassword,
      name: "Aziza Teacher",
      role: "TEACHER",
    },
    create: {
      name: "Aziza Teacher",
      username: "teacher",
      password: teacherPassword,
      role: "TEACHER",
    },
  });

  // 2. Group 1: "JUFT 14-16" (Tuesday, Thursday, Saturday: 14:00 - 16:00)
  let juftGroup = await prisma.group.findFirst({
    where: {
      OR: [
        { name: "JUFT 14-16" },
        { name: { contains: "Juft" } },
        { name: { contains: "14-16" } },
      ],
    },
  });

  if (juftGroup) {
    await prisma.group.update({
      where: { id: juftGroup.id },
      data: { name: "JUFT 14-16" },
    });
    await prisma.groupSchedule.deleteMany({ where: { groupId: juftGroup.id } });
    await prisma.groupSchedule.createMany({
      data: [
        { groupId: juftGroup.id, dayOfWeek: 2, startTime: "14:00", endTime: "16:00" }, // Seshanba (Tue)
        { groupId: juftGroup.id, dayOfWeek: 4, startTime: "14:00", endTime: "16:00" }, // Payshanba (Thu)
        { groupId: juftGroup.id, dayOfWeek: 6, startTime: "14:00", endTime: "16:00" }, // Shanba (Sat)
      ],
    });
  } else {
    juftGroup = await prisma.group.create({
      data: {
        name: "JUFT 14-16",
        schedules: {
          create: [
            { dayOfWeek: 2, startTime: "14:00", endTime: "16:00" },
            { dayOfWeek: 4, startTime: "14:00", endTime: "16:00" },
            { dayOfWeek: 6, startTime: "14:00", endTime: "16:00" },
          ],
        },
      },
    });
  }

  // 11 students for JUFT 14-16
  const juftStudents = [
    "Jabborova Bahora",
    "Sarvinoz O'tabova",
    "Durdona Ashirova",
    "İsaqulova Charos",
    "Marjona Husanova",
    "Munira Musurmonova",
    "Umida Safarova",
    "Dilnoza",
    "Xasanbek",
    "Shahrizoda",
    "Risola",
  ];

  for (const name of juftStudents) {
    const existing = await prisma.student.findFirst({
      where: { name, groupId: juftGroup.id },
    });
    if (!existing) {
      await prisma.student.create({
        data: {
          name,
          phone: "+998 -- --- -- --",
          tuitionFee: 450000,
          groupId: juftGroup.id,
          isActive: true,
        },
      });
    }
  }

  // 3. Group 2: "TOQ 18-20" (Monday, Wednesday, Friday: 18:00 - 20:00)
  let toqGroup = await prisma.group.findFirst({
    where: {
      OR: [
        { name: "TOQ 18-20" },
        { name: "TOQ 6-8" },
      ],
    },
  });

  if (toqGroup) {
    await prisma.group.update({
      where: { id: toqGroup.id },
      data: { name: "TOQ 18-20" },
    });
    await prisma.groupSchedule.deleteMany({ where: { groupId: toqGroup.id } });
    await prisma.groupSchedule.createMany({
      data: [
        { groupId: toqGroup.id, dayOfWeek: 1, startTime: "18:00", endTime: "20:00" }, // Dushanba (Mon)
        { groupId: toqGroup.id, dayOfWeek: 3, startTime: "18:00", endTime: "20:00" }, // Chorshanba (Wed)
        { groupId: toqGroup.id, dayOfWeek: 5, startTime: "18:00", endTime: "20:00" }, // Juma (Fri)
      ],
    });
  } else {
    toqGroup = await prisma.group.create({
      data: {
        name: "TOQ 18-20",
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
            { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
            { dayOfWeek: 5, startTime: "18:00", endTime: "20:00" },
          ],
        },
      },
    });
  }

  // 15 students for TOQ 18-20
  const toqStudents = [
    "Humoyunshox Abdurahmonov",
    "To'xtaboyeva Sevinch",
    "Shox",
    "Behruzbek",
    "Marg'iyona Azzamova",
    "Bunyodbek",
    "Aziz",
    "Nazirqulov",
    "Nursulton",
    "Hayitboyev Suhrob",
    "Feruza",
    "Sulaymonov",
    "İbragimova Aziza",
    "Dilmurodovich",
    "Husanboyev",
  ];

  for (const name of toqStudents) {
    const existing = await prisma.student.findFirst({
      where: { name, groupId: toqGroup.id },
    });
    if (!existing) {
      await prisma.student.create({
        data: {
          name,
          phone: "+998 -- --- -- --",
          tuitionFee: 450000,
          groupId: toqGroup.id,
          isActive: true,
        },
      });
    }
  }

  // 4. Remove empty demo/placeholder groups that have no students
  const emptyOldGroups = await prisma.group.findMany({
    where: {
      name: {
        in: [
          "Toq (10:00 - 11:30)",
          "Türkçe A1 - Başlangıç (Ertalab)",
          "TÖMER B1-B2 - Intensive (Kechki)",
          "Türkçe Konuşma Kulübü (Dam olish)",
        ],
      },
      students: { none: {} },
    },
  });

  for (const eg of emptyOldGroups) {
    await prisma.group.delete({ where: { id: eg.id } });
    console.log(`🧹 Cleaned up old placeholder: ${eg.name}`);
  }

  console.log("✅ Database synced successfully!");
  console.log(`   Group 1: ${juftGroup.name} (${juftStudents.length} students, 14:00 - 16:00)`);
  console.log(`   Group 2: ${toqGroup.name} (${toqStudents.length} students, 18:00 - 20:00)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
