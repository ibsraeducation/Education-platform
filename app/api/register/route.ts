import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Gender, Role } from "@/lib/roles";

const registerSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    whatsappCountryCode: z.string().min(1).max(5).regex(/^\d+$/),
    whatsappNationalNumber: z.string().min(4).max(20).regex(/^\d+$/),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      role: Role.STUDENT,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender,
      whatsappCountryCode: data.whatsappCountryCode,
      whatsappNationalNumber: data.whatsappNationalNumber,
    },
  });
  return NextResponse.json({ ok: true });
}
