import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { auth } from "@/auth";
import { youtubeVideoId } from "@/lib/embed";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import ytdl from "@distube/ytdl-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Long streams; raise if your host supports it (e.g. Vercel). */
export const maxDuration = 300;

/**
 * Proxies YouTube audio for the article’s configured audioUrl only.
 * Logged-in users may stream if the article is published or they are the author (preview).
 * Output is YouTube’s native audio container (often webm/opus or m4a), playable in HTML5 audio.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const v = url.searchParams.get("v")?.trim();

  if (!slug || !v || !/^[\w-]{11}$/.test(v)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canAccess =
    article.published ||
    (session.user.role === Role.ADMIN && article.authorId === session.user.id);
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expected = youtubeVideoId(article.audioUrl ?? "");
  if (!expected || expected !== v) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const info = await ytdl.getInfo(v);
    const format = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });
    if (!format) {
      return NextResponse.json({ error: "No audio format" }, { status: 502 });
    }

    const stream = ytdl.downloadFromInfo(info, { format });
    const mime =
      format.mimeType?.split(";")[0]?.trim() || "audio/webm";

    req.signal.addEventListener("abort", () => {
      stream.destroy();
    });

    const webStream = Readable.toWeb(stream);

    return new Response(webStream as unknown as ReadableStream<Uint8Array>, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[youtube-audio]", e);
    return NextResponse.json(
      { error: "Stream unavailable" },
      { status: 502 },
    );
  }
}
