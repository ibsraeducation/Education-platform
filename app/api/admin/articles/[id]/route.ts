import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ContentFormat, Role } from "@/lib/roles";
import { z } from "zod";
import { isGoogleDriveUrl } from "@/lib/embed";

function isValidUrlOrUpload(s: string) {
  if (s === "") return true;
  if (s.startsWith("/uploads/")) return true;
  return z.string().url().safeParse(s).success;
}

function isValidUploadedAudio(s: string) {
  if (s === "") return true;
  if (!s.startsWith("/uploads/")) return false;
  const lower = s.toLowerCase();
  return (
    lower.endsWith(".mp3") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".aac") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".wav")
  );
}

const optUrl = z
  .string()
  .optional()
  .transform((s) => (s == null ? "" : String(s).trim()))
  .refine(isValidUrlOrUpload, { message: "Invalid URL" });

function mediaUrlField(kind: "video" | "audio") {
  return optUrl.refine((s) => !isGoogleDriveUrl(s), {
    message: `Google Drive / Docs URLs are not allowed for ${kind}`,
  });
}

const uploadedAudioField = optUrl.refine(isValidUploadedAudio, {
  message: "Audio must be an uploaded file (MP3/M4A/AAC/WebM/WAV)",
});

const optCategoryId = z
  .string()
  .optional()
  .transform((s) => (s == null ? "" : String(s).trim()));

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  videoUrl: mediaUrlField("video"),
  audioUrl: uploadedAudioField,
  content: z.string().min(1),
  contentFormat: z.literal(ContentFormat.MARKDOWN),
  publishName: z.string().min(1).max(120),
  authorIconUrl: optUrl,
  socialTwitter: optUrl,
  socialYoutube: optUrl,
  socialInstagram: optUrl,
  socialFacebook: optUrl,
  socialLinkedin: optUrl,
  published: z.boolean(),
  categoryId: optCategoryId,
});

function emptyToNull(s: string | undefined) {
  const t = s?.trim();
  return t ? t : null;
}

async function assertOwnArticle(adminId: string, id: string) {
  const article = await prisma.article.findFirst({
    where: { id, authorId: adminId },
  });
  return article;
}

export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const article = await assertOwnArticle(session.user.id, id);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const existing = await assertOwnArticle(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const existing = await assertOwnArticle(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = articleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  let categoryId: string | null = null;
  if (d.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: d.categoryId, authorId: session.user.id },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json(
        { error: { categoryId: ["Invalid category"] } },
        { status: 400 },
      );
    }
    categoryId = cat.id;
  }

  let slug = existing.slug;
  if (d.title.trim() !== existing.title) {
    const base = slugify(d.title);
    let candidate = base;
    let n = 0;
    while (
      await prisma.article.findFirst({
        where: { slug: candidate, NOT: { id } },
      })
    ) {
      candidate = `${base}-${++n}`;
    }
    slug = candidate;
  }
  const article = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title: d.title.trim(),
      videoUrl: emptyToNull(d.videoUrl),
      audioUrl: emptyToNull(d.audioUrl),
      content: d.content,
      contentFormat: d.contentFormat,
      publishName: d.publishName.trim(),
      authorIconUrl: emptyToNull(d.authorIconUrl),
      socialTwitter: emptyToNull(d.socialTwitter),
      socialYoutube: emptyToNull(d.socialYoutube),
      socialInstagram: emptyToNull(d.socialInstagram),
      socialFacebook: emptyToNull(d.socialFacebook),
      socialLinkedin: emptyToNull(d.socialLinkedin),
      published: d.published,
      categoryId,
    },
  });
  return NextResponse.json({ article });
}
