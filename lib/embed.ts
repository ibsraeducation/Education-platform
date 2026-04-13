/** True for Google Drive / Docs URLs — never used as a media source. */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, "");
    return host === "drive.google.com" || host === "docs.google.com";
  } catch {
    return false;
  }
}

/** Resolve YouTube watch / short / youtu.be URLs to an embed-friendly origin. */
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const embed = u.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Returns an embed src for a video URL.
 * Supported: YouTube only. Google Drive is intentionally NOT supported.
 */
export function videoEmbedSrc(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  if (isGoogleDriveUrl(url)) return null;
  const yt = youtubeVideoId(url);
  if (yt) {
    const q = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      fs: "0",
      disablekb: "1",
      iv_load_policy: "3",
    });
    return `https://www.youtube.com/embed/${yt}?${q.toString()}`;
  }
  return null;
}

/** How article audio should be rendered. */
export type AudioEmbedInfo =
  | { kind: "direct"; src: string }
  | { kind: "youtube"; videoId: string };

/**
 * Returns embed info for an audio URL.
 * Supported: direct audio files, or YouTube (streamed via /api/youtube-audio in the site player).
 * Google Drive is intentionally NOT supported.
 */
export function audioEmbedInfo(url: string | null | undefined): AudioEmbedInfo | null {
  if (!url?.trim()) return null;
  if (isGoogleDriveUrl(url)) return null;
  const lower = url.toLowerCase();
  if (
    lower.endsWith(".mp3") ||
    lower.includes(".mp3?") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".flac") ||
    lower.endsWith(".webm")
  ) {
    return { kind: "direct", src: url.trim() };
  }
  const yt = youtubeVideoId(url);
  if (yt) {
    return { kind: "youtube", videoId: yt };
  }
  return null;
}
