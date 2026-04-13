import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";

export async function POST(
  _req: Request,
  ctx: { params: { slug: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  const { slug } = ctx.params;
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.articleView.create({
    data: {
      articleId: article.id,
      studentId: session.user.id,
    },
  });
  return NextResponse.json({ ok: true });
}
