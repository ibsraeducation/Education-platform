import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const cat = await prisma.category.findFirst({
    where: { id, authorId: session.user.id },
  });
  if (!cat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
