import { describe, expect, it } from "vitest";
import {
  audioEmbedInfo,
  isGoogleDriveUrl,
  videoEmbedSrc,
  youtubeVideoId,
} from "./embed";

describe("youtubeVideoId", () => {
  it("parses watch URL", () => {
    expect(
      youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("parses youtu.be", () => {
    expect(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses shorts", () => {
    expect(
      youtubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("returns null for invalid", () => {
    expect(youtubeVideoId("not a url")).toBeNull();
  });
});

describe("isGoogleDriveUrl", () => {
  it("detects Drive file links", () => {
    expect(
      isGoogleDriveUrl(
        "https://drive.google.com/file/d/1AbCdEfGhIjKlMnO/view",
      ),
    ).toBe(true);
  });

  it("detects Docs / Drive open links", () => {
    expect(
      isGoogleDriveUrl("https://drive.google.com/open?id=abcdefghijklmnop"),
    ).toBe(true);
  });

  it("is false for YouTube", () => {
    expect(isGoogleDriveUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(false);
  });
});

describe("videoEmbedSrc", () => {
  it("builds YouTube embed", () => {
    expect(videoEmbedSrc("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3",
    );
  });

  it("rejects Google Drive", () => {
    expect(
      videoEmbedSrc("https://drive.google.com/file/d/abc123xyz/view"),
    ).toBeNull();
  });

  it("returns null for empty", () => {
    expect(videoEmbedSrc("")).toBeNull();
    expect(videoEmbedSrc(null)).toBeNull();
  });
});

describe("audioEmbedInfo", () => {
  it("detects mp3 URL", () => {
    expect(audioEmbedInfo("https://example.com/a.mp3")).toEqual({
      kind: "direct",
      src: "https://example.com/a.mp3",
    });
  });

  it("rejects Google Drive audio links", () => {
    expect(
      audioEmbedInfo("https://drive.google.com/file/d/xyz123/view"),
    ).toBeNull();
  });

  it("uses YouTube id for site audio stream", () => {
    const r = audioEmbedInfo("https://youtu.be/dQw4w9WgXcQ");
    expect(r).toEqual({ kind: "youtube", videoId: "dQw4w9WgXcQ" });
  });
});
