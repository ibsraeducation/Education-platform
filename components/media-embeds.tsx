import { audioEmbedInfo, videoEmbedSrc } from "@/lib/embed";
import { VideoPlayer } from "@/components/video-player";
import { CustomAudioPlayer } from "@/components/custom-audio-player";

function StudentMediaBanner({ name }: { name: string }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 select-none">
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      <p className="text-xs leading-snug text-amber-100/90">
        <span className="font-semibold text-amber-50">{name}</span>
        <span className="text-amber-200/75">
          {" "}
          — personal license. Do not share, redistribute, or download this
          media.
        </span>
      </p>
    </div>
  );
}

export function MediaEmbeds({
  articleSlug,
  videoUrl,
  audioUrl,
  watermarkName,
}: {
  articleSlug: string;
  videoUrl: string | null;
  audioUrl: string | null;
  watermarkName?: string;
}) {
  const videoSrc = videoEmbedSrc(videoUrl);
  const audio = audioEmbedInfo(audioUrl);

  const hasUnsupported =
    (!videoSrc && !!videoUrl?.trim()) || (!audio && !!audioUrl?.trim());

  if (!videoSrc && !audio && !hasUnsupported) return null;

  return (
    <div className="space-y-8">
      {/* Unsupported source notice */}
      {hasUnsupported && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs text-red-300/70">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Video must be a YouTube URL. Audio must be a direct file link or a
          YouTube URL (played in the site audio player). Cloud file-sharing
          links are not supported.
        </div>
      )}

      {videoSrc && (
        <div>
          {watermarkName ? (
            <StudentMediaBanner name={watermarkName} />
          ) : null}
          <VideoPlayer src={videoSrc} />
        </div>
      )}

      {audio && audio.kind === "direct" && (
        <div>
          {watermarkName ? (
            <StudentMediaBanner name={watermarkName} />
          ) : null}
          <CustomAudioPlayer src={audio.src} />
        </div>
      )}

      {audio && audio.kind === "youtube" && (
        <div>
          {watermarkName ? (
            <StudentMediaBanner name={watermarkName} />
          ) : null}
          <CustomAudioPlayer
            src={`/api/youtube-audio?slug=${encodeURIComponent(articleSlug)}&v=${encodeURIComponent(audio.videoId)}`}
          />
        </div>
      )}
    </div>
  );
}
