"use client";

/**
 * YouTube iframe: we cannot remove native controls via API. Transparent overlays
 * block the top bar (settings / overflow menu) and bottom-corner share/link
 * hotspots. fs=0 is set in embed URL. This deters casual copy-link use; a
 * determined user can still recover the video id from the network tab.
 */
export function VideoPlayer({ src }: { src: string }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/[0.06]"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 opacity-80 pointer-events-none" />
      <div className="relative aspect-video w-full bg-black">
        <iframe
          title="Video"
          src={src}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {/* Block top chrome: settings gear, overflow, CC triggers */}
        <div
          className="pointer-events-auto absolute inset-x-0 top-0 z-20 h-[52px] select-none"
          aria-hidden
          onContextMenu={(e) => e.preventDefault()}
        />
        {/* Bottom corners: share / clip / watch later */}
        <div
          className="pointer-events-auto absolute bottom-0 left-0 z-20 h-16 w-32 select-none"
          aria-hidden
          onContextMenu={(e) => e.preventDefault()}
        />
        <div
          className="pointer-events-auto absolute bottom-0 right-0 z-20 h-16 w-40 select-none"
          aria-hidden
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
