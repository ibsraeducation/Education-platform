import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@/lib/roles";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedAudio = [
    "audio/mpeg",
    "audio/mp3",
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
  ];

  const isAudio = allowedAudio.includes(file.type);
  const isImage = allowedImages.includes(file.type);

  if (!isAudio && !isImage) {
    return NextResponse.json(
      {
        error:
          "Allowed: images (JPEG, PNG, WebP, GIF) or audio (MP3, M4A, AAC, WebM, WAV)",
      },
      { status: 400 },
    );
  }

  const maxSize = isAudio ? 40 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: isAudio
          ? "Audio must be under 40 MB"
          : "Image must be under 5 MB",
      },
      { status: 400 },
    );
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);

  let ext: string;
  let prefix: string;
  if (isAudio) {
    prefix = "audio";
    const map: Record<string, string> = {
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/webm": "webm",
      "audio/wav": "wav",
      "audio/x-wav": "wav",
      "audio/mp4": "m4a",
      "audio/x-m4a": "m4a",
      "audio/aac": "aac",
    };
    ext = map[file.type] ?? "audio";
  } else {
    prefix = "author";
    ext = file.type.split("/")[1].replace("jpeg", "jpg");
  }

  const filename = `${prefix}-${timestamp}-${random}.${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
