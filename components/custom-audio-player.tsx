"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg className="ml-0.5 h-6 w-6 text-zinc-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-6 w-6 text-zinc-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => {
      setDuration(a.duration);
      setLoaded(true);
    };
    const onTime = () => setCurrentTime(a.currentTime);
    const onEnded = () => setPlaying(false);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      await a.play().catch(() => null);
      setPlaying(true);
    }
  }, [playing]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.volume = v;
    setVolume(v);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPct = volume * 100;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/[0.06]"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-zinc-200 shadow-lg shadow-black/40 transition hover:brightness-110 active:scale-[0.97]"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Audio
            </span>
            <div className="tabular-nums text-xs text-zinc-500">
              <span className="text-zinc-300">{fmt(currentTime)}</span>
              <span className="mx-1 text-zinc-600">/</span>
              <span>{loaded ? fmt(duration) : "—:—"}</span>
            </div>
          </div>

          <div className="group/scrub relative h-2 w-full rounded-full bg-white/[0.08]">
            <div
              className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
              style={{ width: `${progress}%` }}
            />
            <div
              className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white shadow-md transition-opacity group-hover/scrub:opacity-100"
              style={{
                left: `${progress}%`,
                opacity: loaded ? 0.85 : 0,
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={seek}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Seek"
            />
          </div>

          <div className="flex items-center gap-3">
            <SpeakerIcon muted={volume === 0} />
            <div className="relative h-1.5 flex-1 max-w-[140px] rounded-full bg-white/[0.08] sm:flex-initial sm:w-28">
              <div
                className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-white/35"
                style={{ width: `${volPct}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={changeVolume}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        controlsList="nodownload"
      />
    </div>
  );
}
