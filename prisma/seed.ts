import { PrismaClient } from "@prisma/client";
import { Role } from "../lib/roles";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash: hash,
      role: Role.ADMIN as string,
      firstName: "Admin",
      lastName: "User",
    },
    update: {
      passwordHash: hash,
      role: Role.ADMIN as string,
    },
  });
  console.log(`Seeded admin: ${email} / ${password}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
