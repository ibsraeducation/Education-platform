import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { Role } from "@/lib/roles";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const categories = await prisma.category.findMany({
    where: { authorId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      _count: { select: { articles: true } },
    },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const name = parsed.data.name.trim();
  const base = slugify(name);
  let slug = base;
  let n = 0;
  while (
    await prisma.category.findUnique({
      where: {
        authorId_slug: { authorId: session.user.id, slug },
      },
    })
  ) {
    slug = `${base}-${++n}`;
  }
  const maxOrder = await prisma.category.aggregate({
    where: { authorId: session.user.id },
    _max: { sortOrder: true },
  });
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      authorId: session.user.id,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json({ category });
}
