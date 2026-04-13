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
  /** Stored as Markdown; rendered to HTML in the article template. */
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const articles = await prisma.article.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      updatedAt: true,
      _count: { select: { views: true } },
    },
  });
  return NextResponse.json({ articles });
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

  const base = slugify(d.title);
  let slug = base;
  let n = 0;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  const article = await prisma.article.create({
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
      authorId: session.user.id,
    },
  });
  return NextResponse.json({ article });
}
