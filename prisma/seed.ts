import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Prisma Postgres database...");

  // 1. Create or update Admin & Teacher users with hashed passwords
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

  console.log("✅ Users seeded (admin / teacher) with hashed passwords");

  // 2. Create the requested group: "Juft (14:00- 16:00)"
  let juftGroup = await prisma.group.findFirst({
    where: { name: { contains: "Juft" } },
  });

  if (!juftGroup) {
    juftGroup = await prisma.group.create({
      data: {
        name: "Juft (14:00- 16:00)",
        schedules: {
          create: [
            { dayOfWeek: 2, startTime: "14:00", endTime: "16:00" }, // Seshanba (Tue)
            { dayOfWeek: 4, startTime: "14:00", endTime: "16:00" }, // Payshanba (Thu)
            { dayOfWeek: 6, startTime: "14:00", endTime: "16:00" }, // Shanba (Sat)
          ],
        },
      },
    });
  } else {
    // Ensure name and schedules
    await prisma.group.update({
      where: { id: juftGroup.id },
      data: { name: "Juft (14:00- 16:00)" },
    });
    const schedCount = await prisma.groupSchedule.count({
      where: { groupId: juftGroup.id },
    });
    if (schedCount === 0) {
      await prisma.groupSchedule.createMany({
        data: [
          { groupId: juftGroup.id, dayOfWeek: 2, startTime: "14:00", endTime: "16:00" },
          { groupId: juftGroup.id, dayOfWeek: 4, startTime: "14:00", endTime: "16:00" },
          { groupId: juftGroup.id, dayOfWeek: 6, startTime: "14:00", endTime: "16:00" },
        ],
      });
    }
  }

  // Also create a morning group if no other groups exist
  const totalGroups = await prisma.group.count();
  if (totalGroups <= 1) {
    await prisma.group.create({
      data: {
        name: "Toq (10:00 - 11:30)",
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: "10:00", endTime: "11:30" }, // Dushanba
            { dayOfWeek: 3, startTime: "10:00", endTime: "11:30" }, // Chorshanba
            { dayOfWeek: 5, startTime: "10:00", endTime: "11:30" }, // Juma
          ],
        },
      },
    });
  }

  // 3. Add the 11 students to "Juft (14:00- 16:00)"
  const studentNames = [
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

  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
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

  console.log(`✅ Seeded ${studentNames.length} students into '${juftGroup.name}'!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
