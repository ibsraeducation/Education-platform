"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
      method: "POST",
    });
  }, [slug]);
  return null;
}
